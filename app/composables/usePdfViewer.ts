export async function usePdfViewer(pdfUrl: MaybeRef<string>) {
  const pdf = shallowRef<PDFDocumentLoadingTask | undefined>(undefined)
  const pages = ref(0)
  // const { VuePDF } = import.meta.client ? await import('@tato30/vue-pdf') : { VuePDF: undefined }

  onMounted(async () => {
    const { usePDF } = await import('@tato30/vue-pdf')
    const { pdf: _pdf, pages: _pages } = usePDF(pdfUrl)
    watchEffect(() => {
      pdf.value = _pdf.value
      pages.value = _pages.value
    })
  })

  return { pdf, pages }
}
