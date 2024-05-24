import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy'
import type { RollupOptions } from 'rollup'

export const rollupOptions: RollupOptions = {
  external: ['pdfjs-dist', 'vue'],
  output: {
    globals: {
      vue: 'Vue',
    },
    assetFileNames: (assetInfo) => {
      switch (assetInfo.name) {
        case 'style.css':
          return 'style/index.css'
        default:
          return assetInfo.name as string
      }
    },
    compact: true,
  },
}

export default defineConfig({
  plugins: [
    copy({
      hook: 'writeBundle',
      targets: [
        {
          src: 'src/pdf_viewer.css',
          dest: 'dist/style',
        },
      ],
    }),
    vue(),
  ],
  build: {
    lib: {
      entry: new URL('./src/index.ts', import.meta.url).pathname,
      name: 'VuePdfEmbed',
      fileName: 'index',
    },
    rollupOptions,
  },
})
