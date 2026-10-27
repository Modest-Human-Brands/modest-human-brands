// MDoc reports its own status words; the stage page works with these six
const statusAliases: Record<string, ProjectDocumentStatus> = {
  plan: 'draft',
  draft: 'draft',
  ready: 'ready',
  sent: 'sent',
  pending: 'sent',
  'partially-signed': 'partially-signed',
  partiallysigned: 'partially-signed',
  completed: 'completed',
  signed: 'completed',
  delivered: 'completed',
  void: 'void',
  voided: 'void',
}

function toDocumentStatus(status: string): ProjectDocumentStatus {
  return (
    statusAliases[
      status
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
    ] ?? 'draft'
  )
}

export default defineEventHandler<Promise<ProjectDocument[]>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))
    if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })

    const activeOrgId = getActiveOrgId(event, user)
    const record = (await useStorage<Resource<'project'>>('data:resource:project').getItem(projectId))?.record
    assertProjectInOrg(record, activeOrgId)

    const slug = record?.properties.Slug?.formula?.string
    const orgProjects = await getOrgProjects(activeOrgId)

    return (await listDocuments())
      .filter((doc) => (doc.project?.slug === slug || (doc as { projectId?: string }).projectId === projectId) && isDocInOrg(doc, activeOrgId, orgProjects))
      .map((doc) => ({
        id: doc.id,
        title: doc.name && doc.name !== 'Empty' ? doc.name : doc.templateId.split('-').join(' '),
        fileType: doc.mimeType.split('/').pop()?.toUpperCase() || 'FILE',
        status: toDocumentStatus(doc.status),
        updatedAt: doc.updatedAt,
        sizeBytes: doc.sizeBytes,
        contact: doc.contact,
        previewUrl: doc.previewUrl,
      }))
      .toSorted((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    console.error('API project/[projectId]/document GET', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch project documents' })
  }
})
