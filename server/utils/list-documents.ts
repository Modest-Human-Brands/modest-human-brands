import type { MDocDocumentListResponse } from '../api/doc/[projectId]/index.get'

const PAGE_SIZE = 100

/** Every MDoc document, following the list's pagination so filtering never sees only the first page. */
export async function listDocuments(): Promise<MDocDocumentListResponse['results']> {
  const config = useRuntimeConfig()
  const documents: MDocDocumentListResponse['results'] = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await $fetch<MDocDocumentListResponse>('/api/document', {
      baseURL: config.public.docUrl,
      headers: serviceHeaders('doc'),
      query: { limit: PAGE_SIZE, offset },
    })

    documents.push(...page.results)
    if (!page.results.length || offset + PAGE_SIZE >= page.pagination.total) return documents
  }
}
