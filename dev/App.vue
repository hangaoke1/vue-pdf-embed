<script setup lang="ts">
import { reactive } from 'vue'
import VuePdfEmbed from '../src/index'

const state = reactive({
  scale: 1,
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
</script>

<template>
  <div>
    <button @click="state.scale += 0.1">放大</button>
    <button @click="state.scale -= 0.1">缩小</button>
    <div
      style="
        width: 1000px;
        border: 1px solid red;
        overflow: auto;
        height: 800px;
      "
    >
      <VuePdfEmbed
        style="width: 100%"
        :width="state.scale * 500"
        :source="pdfSource"
        text-layer
        :highlight-text="['Hello']"
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
}
</style>
