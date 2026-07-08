export interface Project {
  id: string
  title: string
  slug: string
  status: ProjectStatus
  shootLocation?: string
  shootDate?: string
  quoteNumber?: number
}

export interface ProjectDeliverable {
  title: string
  quantity?: number
  rate?: number
  description?: string
  points?: string[]
}

export interface DetailedProject extends Project {
  index?: number
  segment?: string
  date?: string
  duration?: string
  contactName?: string
  budget?: number
  additional?: string
  deliverables?: ProjectDeliverable[]
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

    const deliverableIds = props.Deliverables?.relation?.map((r: { id: string }) => notionNormalizeId(r.id) as string) || []
    let deliverables: ProjectDeliverable[] = []

    if (deliverableIds.length > 0) {
      const deliverableStorage = useStorage<Resource<'deliverable'>>('data:resource:deliverable')
      const items = (await Promise.all(deliverableIds.map((id: string) => deliverableStorage.getItem(id)))).filter((i) => !!i)

      deliverables = items.map(
        ({ record: { properties: props } }) =>
          props && {
            title: props.Title?.title?.[0]?.plain_text || 'Untitled Deliverable',
            quantity: props.Quantity?.number ?? undefined,
            rate: props.Rate?.number ?? undefined,
            description: props.Description?.rich_text?.[0]?.text?.content || undefined,
            points: props.Points?.multi_select?.map((p: { name: string }) => p.name) || undefined,
          }
      )
    }

    return {
      id: record.id,
      title: props.Name?.title?.[0]?.plain_text || 'Untitled Project',
      index: props.Index?.number,
      slug: props.Slug?.formula?.string || record.id,
      status: (props.Status?.status?.name as ProjectStatus) || 'Plan',
      segment: undefined,
      shootLocation: props.Address?.rich_text?.[0]?.text?.content,
      shootDate: props.Date?.date?.start.split('T')[0],
      callTime: props.Date?.date?.start?.includes('T')
        ? new Date(props.Date.date.start).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : null,
      quoteNumber: props.Quotation?.number,
      duration: undefined,
      contactName: undefined,
      budget: props.Budget?.number,
      additional: undefined,
      deliverables,
    } as DetailedProject
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    console.error('API /project/[projectId] GET', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch project details' })
  }
})
