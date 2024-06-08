<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { escapeRegExp } from 'lodash'
import { computed, onBeforeUnmount, ref, shallowRef, toRef, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { AnnotationLayer, renderTextLayer } from 'pdfjs-dist/legacy/build/pdf'
import { PDFLinkService } from 'pdfjs-dist/web/pdf_viewer'
import {
  PixelsPerInch,
  type OnProgressParameters,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type PageViewport,
} from 'pdfjs-dist'

import type { PasswordRequestParams, Source } from './types'
import { emptyElement, releaseChildCanvases } from './utils'
import { useVuePdfEmbed } from './composables'

const props = withDefaults(
  defineProps<{
    /**
     * Whether to enable an annotation layer.
     */
    annotationLayer?: boolean
    /**
     * Root element identifier (inherited by page containers with page number
     * postfixes).
     */
    id?: string
    /**
     * Path for annotation icons, including trailing slash.
     */
    imageResourcesPath?: string
    /**
     * Number of the page to display.
     */
    page: number
    /**
     * Desired page rotation angle.
     */
    rotation?: number
    /**
     * Source of the document to display.
     */
    source: Source
    /**
     * Whether to enable a text layer.
     */
    textLayer?: boolean
    /**
     * Text to highlight.
     */
    highlightText?: string
  }>(),
  {
    rotation: 0,
  }
)

const emit = defineEmits<{
  (e: 'internal-link-clicked', value: number): void
  (e: 'loaded', value: PDFDocumentProxy): void
  (e: 'loading-failed', value: Error): void
  (e: 'password-requested', value: PasswordRequestParams): void
  (e: 'progress', value: OnProgressParameters): void
  (e: 'rendered'): void
  (e: 'rendering-failed', value: Error): void
}>()

const pageRef = shallowRef<HTMLDivElement | null>(null)
const pageWrapRef = shallowRef<HTMLDivElement | null>(null)
const root = shallowRef<HTMLDivElement | null>(null)
const currentScale = ref(1)
const currentScaleValue = ref<string>('auto')

const { doc } = useVuePdfEmbed({
  onError: (e) => {
    emit('loading-failed', e)
  },
  onPasswordRequest({ callback, isWrongPassword }) {
    emit('password-requested', { callback, isWrongPassword })
  },
  onProgress: (progressParams) => {
    emit('progress', progressParams)
  },
  source: toRef(props, 'source'),
})

const linkService = computed(() => {
  if (!doc.value || !props.annotationLayer) {
    return null
  }

  const service = new PDFLinkService()
  service.setDocument(doc.value)
  service.setViewer({
    scrollPageIntoView: ({ pageNumber }: { pageNumber: number }) => {
      emit('internal-link-clicked', pageNumber)
    },
  })
  return service
})

const renderTimer = ref<any>(null)

// Zooms the document in or out.
const zoom = (type: 'zoomIn' | 'zoomOut' | 'auto') => {
  if (type === 'zoomIn') {
    currentScale.value += 0.2
    if (currentScale.value > 10) {
      currentScale.value = 10
    }
    setScale(currentScale.value, true)
  }
  if (type === 'zoomOut') {
    currentScale.value -= 0.2
    if (currentScale.value < 0.1) {
      currentScale.value = 0.1
    }
    setScale(currentScale.value, true)
  }

  if (type === 'auto') {
    currentScaleValue.value = 'auto'
    setScale('auto', true)
  }
}

const setScale = (value: number | string, noUpdate: boolean) => {
  const scale = parseFloat(value as string)
  if (isNaN(scale)) {
    currentScaleValue.value = value as string
  } else {
    currentScale.value = scale
    currentScaleValue.value = scale.toString()
  }

  if (noUpdate) {
    render({
      skipCanvas: true,
      skipTextLayer: true,
    })
    clearTimeout(renderTimer.value!)
    renderTimer.value = setTimeout(() => {
      render({
        skipCanvas: false,
        skipTextLayer: true,
      })
    }, 500)
  } else {
    render()
  }
}

function findMatches(article: string, searchString: string) {
  const positions = []
  let position = article.indexOf(searchString)
  while (position !== -1) {
    positions.push(position)
    position = article.indexOf(searchString, position + 1)
  }

  return positions
}

/**
 * Renders the PDF document as canvas element(s) and additional layers.
 */
const render = async ({
  skipCanvas,
  skipTextLayer,
}: {
  skipCanvas?: boolean
  skipTextLayer?: boolean
} = {}) => {
  if (!doc.value) {
    return
  }

  try {
    await Promise.all(
      [props.page].map(async (pageNum) => {
        const page = await doc.value!.getPage(pageNum)
        const pageRotation =
          ((props.rotation % 90 === 0 ? props.rotation : 0) + page.rotate) % 360
        const [canvas, div1, div2] = Array.from(pageRef.value!.children) as [
          HTMLCanvasElement,
          HTMLDivElement,
          HTMLDivElement,
        ]

        const container = root.value!
        const viewportTemp = page.getViewport({
          scale: PixelsPerInch.PDF_TO_CSS_UNITS,
        })

        if (currentScaleValue.value === 'auto') {
          const pageScale = (container.clientWidth - 40) / viewportTemp.width
          currentScale.value = Math.min(1.25, pageScale)
        }

        const viewport = page.getViewport({
          scale: currentScale.value * PixelsPerInch.PDF_TO_CSS_UNITS,
          rotation: pageRotation,
        })

        const w = `var(--scale-factor) * ${
          (viewport.rawDims as any).pageWidth
        }px`
        const h = `var(--scale-factor) * ${
          (viewport.rawDims as any).pageHeight
        }px`
        const widthStr = `calc(${w})`
        const heightStr = `calc(${h})`

        const cssWidth = viewport.width + 'px'
        const cssHeight = viewport.height + 'px'

        if (!skipCanvas) {
          const clonedCanvas = document.createElement('canvas')
          clonedCanvas.style.width = cssWidth
          clonedCanvas.style.height = cssHeight
          await renderPage(
            page,
            viewport.clone({
              scale: viewport.scale * window.devicePixelRatio,
            }),
            clonedCanvas
          )

          // 双缓存，防止闪烁
          const parentEl = canvas.parentElement
          parentEl?.replaceChild(clonedCanvas, canvas)
        } else {
          canvas.style.width = cssWidth
          canvas.style.height = cssHeight
        }

        container.style.setProperty('--scale-factor', viewport.scale + '')
        pageWrapRef.value!.style.width = widthStr
        pageWrapRef.value!.style.height = heightStr

        if (props.textLayer && !skipTextLayer) {
          div1.style.setProperty('--scale-factor', viewport.scale + '')
          await renderPageTextLayer(
            page,
            viewport.clone({
              dontFlip: true,
            }),
            div1
          )
          div1.style.removeProperty('--scale-factor')

          if (props.highlightText) {
            const layerChildren = div1.querySelectorAll('[role="presentation"]')
            const textContentItemsStr: string[] = []
            for (const child of layerChildren) {
              // 过滤空格节点
              if (child.textContent === ' ') {
                textContentItemsStr.push('')
              } else {
                textContentItemsStr.push(child.textContent || '')
              }
            }
            const textSumStr = textContentItemsStr.join('')
            console.log('textSumStr', textSumStr)

            // [0, 4, 8, 12] 匹配到的开始索引
            const matchesStartIdx = findMatches(textSumStr, props.highlightText)
            const matchesLen = props.highlightText.length

            const actions = []

            let pos = 0
            const existMap: Record<string, boolean> = {}
            for (let i = 0; i < textContentItemsStr.length; i++) {
              const iStart = pos // 当前这段的开始索引
              const iEnd = pos + textContentItemsStr[i].length // 当前这段的结束索引
              const iRange = [iStart, iEnd]

              for (const matchStartIdx of matchesStartIdx) {
                const range = [matchStartIdx, matchStartIdx + matchesLen]
                const intersection = [
                  Math.max(range[0], iRange[0]),
                  Math.min(range[1], iRange[1]),
                ]
                if (intersection[0] < intersection[1] && !existMap[i]) {
                  const str = textContentItemsStr[i].substring(
                    intersection[0] - iStart,
                    intersection[1] - iStart
                  )
                  actions.push({
                    idx: i,
                    text: str,
                  })
                  existMap[i] = true
                }
              }

              pos += textContentItemsStr[i].length
            }

            actions.forEach((item) => {
              const { idx, text } = item
              const elem = layerChildren[idx]
              let innerHTML = elem.innerHTML
              innerHTML = innerHTML.replace(
                new RegExp(escapeRegExp(text), 'g'),
                (match) => `<span class="highlight appended">${match}</span>`
              )
              elem.innerHTML = innerHTML
            })
          }
        }

        if (props.annotationLayer) {
          await renderPageAnnotationLayer(
            page,
            viewport.clone({
              dontFlip: true,
            }),
            div2 || div1
          )
        }
      })
    )

    emit('rendered')
  } catch (e) {
    emit('rendering-failed', e as Error)
  }
}

/**
 * Renders the page content.
 * @param page - Page proxy.
 * @param viewport - Page viewport.
 * @param canvas - HTML canvas.
 */
const renderPage = async (
  page: PDFPageProxy,
  viewport: PageViewport,
  canvas: HTMLCanvasElement
) => {
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({
    canvasContext: canvas.getContext('2d')!,
    viewport,
  }).promise
}

/**
 * Renders the annotation layer for the specified page.
 * @param page - Page proxy.
 * @param viewport - Page viewport.
 * @param container - HTML container.
 */
const renderPageAnnotationLayer = async (
  page: PDFPageProxy,
  viewport: PageViewport,
  container: HTMLDivElement
) => {
  emptyElement(container)
  new AnnotationLayer({
    accessibilityManager: null,
    annotationCanvasMap: null,
    div: container,
    l10n: null,
    page,
    viewport,
  } as any).render({
    annotations: await page.getAnnotations(),
    div: container,
    // @ts-expect-error: no downloading assumed
    downloadManager: null,
    imageResourcesPath: props.imageResourcesPath,
    linkService: linkService.value!,
    page,
    renderForms: false,
    viewport,
  })
}

/**
 * Renders the text layer for the specified page.
 * @param page - Page proxy.
 * @param viewport - Page viewport.
 * @param container - HTML container.
 */
const renderPageTextLayer = async (
  page: PDFPageProxy,
  viewport: PageViewport,
  container: HTMLElement
) => {
  emptyElement(container)
  await renderTextLayer({
    container,
    textContentSource: await page.getTextContent(),
    viewport,
  }).promise
}

watch(
  doc,
  () => {
    if (doc.value) {
      emit('loaded', doc.value)
    }
  },
  { immediate: true }
)

watch(
  () => props.source,
  () => {
    releaseChildCanvases(root.value!)
  }
)

watch(
  () => [
    doc.value,
    props.page,
    props.rotation,
    props.textLayer,
    props.annotationLayer,
    props.imageResourcesPath,
  ],
  () => {
    if (doc.value) {
      render()
    }
  },
  { immediate: true }
)

watch(
  () => [props.highlightText],
  () => {
    if (doc.value) {
      render({
        skipCanvas: true,
      })
    }
  },
  { immediate: false }
)

useResizeObserver(root, () => {
  if (currentScaleValue.value === 'auto') {
    setScale('auto', true)
  }
})

onBeforeUnmount(() => {
  releaseChildCanvases(root.value!)
})

defineExpose({
  doc,
  zoom,
  render,
})
</script>

<template>
  <div :id="id" ref="root" class="vue-pdf-embed">
    <div ref="pageWrapRef" class="vue-pdf-embed__pagewrap">
      <div ref="pageRef" class="vue-pdf-embed__page">
        <canvas />

        <div v-if="textLayer" class="textLayer" />

        <div v-if="annotationLayer" class="annotationLayer" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.vue-pdf-embed {
  &__page {
    position: relative;

    canvas {
      display: block;
    }
  }
}
</style>
