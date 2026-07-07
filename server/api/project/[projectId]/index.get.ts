export interface DetailedProject {
  id: string
  title: string
  index?: number
  slug: string
  status: ProjectStatus
  segment?: string
  quotation?: number
  description?: string
  address?: string
  place?: string
  date?: string
  duration?: string
  contactName?: string
  budget?: number
  additional?: string
  organizationName?: string
}

export default defineEventHandler<Promise<DetailedProject>>(async (event) => {
  try {
    // await requireUserSession(event)

    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))

    if (!projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })
    }

    const projectStorage = useStorage<Resource<'project'>>('data:resource:project')
    const record = (await projectStorage.getItem(projectId))?.record

    if (!record || !record.properties) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const props = record.properties

    return {
      id: record.id,
      title: props.Name?.title?.[0]?.plain_text || 'Untitled Project',
      index: props.Index?.number,
      slug: props.Slug?.formula?.string || record.id,
      status: (props.Status?.status?.name as ProjectStatus) || 'Plan',
      segment: undefined, // Add if present in your Notion schema
      description: undefined, // Add if present in your Notion schema
      shootLocation: props.Address?.rich_text?.[0]?.text?.content,
      shootDate: props.Date?.date?.start,
      quoteNumber: props.Quotation?.number,
      duration: undefined, // Add if present in your Notion schema
      contactName: undefined, // Usually requires an expansion query to the Contact relation
      budget: props.Budget?.number,
      additional: undefined, // Add if present in your Notion schema
      organizationName: undefined, // Usually requires an expansion query to the Organization relation
    } as DetailedProject
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    console.error('API /project/[projectId] GET', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch project details' })
  }
})
