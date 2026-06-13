export interface MDocDocumentResponse {
  results: {
    id: string
    templateId: string
    name: string
    mimeType: string
    sizeBytes: number
    status: string
    contact?: {
      name: string
      avatar?: string
    }
    project?: {
      index: number
      name: string
      slug: string
      status: string
    }
    organizationId: string
    previewUrl: string
    createdAt: string
    updatedAt: string
  }[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export default defineEventHandler(async () => {
  try {
    const response = await $fetch<MDocDocumentResponse>('/api/document', {
      baseURL: 'http://localhost:3002',
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
