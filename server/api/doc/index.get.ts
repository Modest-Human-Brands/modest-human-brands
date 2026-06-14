import type { MDocDocumentListResponse } from './[projectId]/index.get'

export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()

    const response = await $fetch<MDocDocumentListResponse>('/api/document', {
      baseURL: config.public.docUrl,
    })

    const projectFolders = new Map<
      string,
      {
        id: string
        title: string
        contactName: string
        contactAvatar: string | null
        status: string
        itemCount: number
      }
    >()

    response.results.forEach((doc) => {
      const projectId = doc.project?.slug || 'unassigned'
      const contactName = doc.contact?.name || 'Unknown Contact'

      if (!projectFolders.has(projectId)) {
        projectFolders.set(projectId, {
          id: projectId,
          title: doc.project?.name || 'Unassigned',
          contactName: contactName,
          contactAvatar: doc.contact?.avatar || null,
          status: doc.project?.status || doc.status || 'Draft',
          itemCount: 0,
        })
      }

      projectFolders.get(projectId)!.itemCount += 1
    })

    return Array.from(projectFolders.values())
  } catch (error) {
    console.error('MDoc Proxy Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch document metadata',
    })
  }
})
