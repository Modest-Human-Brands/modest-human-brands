import type { MDocDocumentListResponse } from './[projectId]/index.get'

export default defineEventHandler(async (event) => {
  try {
    // const { user } =
    await requireUserSession(event)

    const config = useRuntimeConfig()

    const response = await $fetch<MDocDocumentListResponse>('/api/document', {
      baseURL: config.public.docUrl,
    })

    console.log({ response })

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
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /doc GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
