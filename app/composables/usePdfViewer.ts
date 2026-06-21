import type { MaybeRefOrGetter } from 'vue'

export function usePdfViewer(pdfUrl: MaybeRefOrGetter<string>) {
  const pdf = shallowRef(undefined)
  const pages = ref(0)

  onMounted(async () => {
    const { usePDF } = await import('@tato30/vue-pdf')

    const urlRef = toRef(pdfUrl)

    const { pdf: _pdf, pages: _pages } = usePDF(urlRef)

    watchEffect(() => {
      pdf.value = _pdf.value
      pages.value = _pages.value
    })
  })

  return { pdf, pages }
}
