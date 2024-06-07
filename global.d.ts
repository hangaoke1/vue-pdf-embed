declare global {
  interface Window {
    Vue: unknown
    VuePdfEmbed: unknown
    useVuePdfEmbed: unknown
  }
}

declare module '*.pdf'

export {}
