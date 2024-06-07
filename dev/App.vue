<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import VuePdfEmbed from '../src/index'
import testPdf from './test.pdf'
import test2Pdf from './test3.pdf'

const pdfRef = ref<InstanceType<typeof VuePdfEmbed> | null>(null)
const state = reactive({
  hilightText: 'hello',
  hilightTextTemp: '',
  page: 1,
  pdf: 1,
  pdfSource: testPdf,
})

const handleBlur = () => {
  state.hilightText = state.hilightTextTemp
}

const highlight = computed(() => {
  return state.hilightText ? [state.hilightText] : null
})

const changePdf = () => {
  state.pdf = state.pdf === 1 ? 2 : 1
  state.page = 1
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const handleZoom = (type: 'zoomIn' | 'zoomOut' | 'auto') => {
  pdfRef.value?.zoom(type)
}
</script>

<template>
  <div>
    <button @click="changePdf">切换pdf</button>
    <button @click="state.page -= 1">前一页</button>
    <button @click="state.page += 1">后一页</button>
    <button @click="handleZoom('zoomIn')">放大</button>
    <button @click="handleZoom('zoomOut')">缩小</button>
    <button @click="handleZoom('auto')">自适应</button>
    <input v-model="state.hilightTextTemp" type="text" @blur="handleBlur" />
    <div
      style="
        width: 80%;
        max-width: 1000px;
        border: 1px solid red;
        overflow: auto;
        height: 800px;
        margin: auto;
      "
    >
      <VuePdfEmbed
        ref="pdfRef"
        :page="state.page"
        :source="state.pdf === 1 ? testPdf : test2Pdf"
        :highlight-text="highlight"
        text-layer
      />
    </div>
  </div>
</template>

<style lang="scss">
@import '../src/pdf_viewer.css';

body {
  padding: 16px;
  background-color: #ccc;
}

.vue-pdf-embed {
  &__pagewrap {
    margin: auto;
  }
}
</style>
