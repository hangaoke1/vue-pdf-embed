<script setup lang="ts">
import { reactive, ref } from 'vue'
import VuePdfEmbed from '../src/index'

const pdfRef = ref<InstanceType<typeof VuePdfEmbed> | null>(null)
const state = reactive({
  scale: 1,
  highlight: ['Hello'],
  zooming: false,
})

const pdfSource =
  'data:application/pdf;base64,' +
  'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxv' +
  'ZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFn' +
  'ZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBb' +
  'IDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFy' +
  'ZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQg' +
  'MCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBv' +
  'YmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAv' +
  'VGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAog' +
  'IC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8s' +
  'IHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAw' +
  'MCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAK' +
  'MDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAg' +
  'MDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFy' +
  'dHhyZWYKNDkyCiUlRU9G'

const timer = ref()
const handleZoom = (type: 'zoomIn' | 'zoomOut') => {
  state.zooming = true
  if (type === 'zoomIn') {
    state.scale += 0.2
  } else {
    state.scale -= 0.2
  }

  if (timer.value) {
    clearTimeout(timer.value)
  }
  timer.value = setTimeout(() => {
    state.zooming = false
    pdfRef.value?.render()
  }, 500)
}
</script>

<template>
  <div>
    <button @click="handleZoom('zoomIn')">放大</button>
    <button @click="handleZoom('zoomOut')">缩小</button>
    <div
      style="width: 600px; border: 1px solid red; overflow: auto; height: 800px"
    >
      <VuePdfEmbed
        ref="pdfRef"
        :width="state.scale * 500"
        :source="pdfSource"
        :highlight-text="state.highlight"
        :zooming="state.zooming"
        text-layer
      />
    </div>
  </div>
</template>

<style lang="scss">
// @import 'pdfjs-dist/web/pdf_viewer.css';
@import '../src//pdf_viewer.css';
// @import '../dist/style/index.css';
// @import '../dist/style/annotationLayer.css';
// @import '../dist/style/textLayer.css';

body {
  padding: 16px;
  background-color: #ccc;
}

.vue-pdf-embed {
  &__pagewrap {
    margin: auto;
  }
  canvas {
    background-color: #fff;
  }
}
</style>
