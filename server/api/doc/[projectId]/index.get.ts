export interface MDocDocumentListResponse {
  results: {
    id: string
    templateId: string
    name: string
    mimeType: string
    sizeBytes: number
    status: string
    contact?: { name: string; avatar?: string }
    project?: { index: number; name: string; slug: string; status: string }
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

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const activeOrgId = getActiveOrgId(event, user)

  const projectId = getRouterParam(event, 'projectId') || 'default'

  try {
    const orgProjects = await getOrgProjects(activeOrgId)
    const projectDocs = (await listDocuments()).filter((doc) => (doc.project?.slug || 'unassigned') === projectId && isDocInOrg(doc, activeOrgId, orgProjects))

    return projectDocs.map((doc) => {
      const mimeToExt: Record<string, string> = {
        'application/pdf': 'PDF',
        'image/png': 'PNG',
        'image/jpeg': 'JPG',
        'application/vnd.ms-excel': 'Excel Sheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Sheet',
        'application/msword': 'Word Document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
        'application/vnd.ms-powerpoint': 'PowerPoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
      }

      const ext = mimeToExt[doc.mimeType] || doc.mimeType.split('/').pop()?.toUpperCase() || 'FILE'

      const formattedDate = new Date(doc.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

      const friendlyName = doc.name !== 'Empty' && doc.name ? doc.name : doc.templateId.split('-').join(' ')

      return {
        id: doc.id,
        name: friendlyName,
        sizeBytes: doc.sizeBytes,
        extension: ext,
        uploadedBy: {
          name: doc.contact?.name,
          avatar: doc.contact?.avatar,
        },
        uploadedAt: formattedDate,
        project: doc.project?.name,
        source: doc.templateId,
        previewUrl: doc.previewUrl,
      }
    })
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API doc/[projectId] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
