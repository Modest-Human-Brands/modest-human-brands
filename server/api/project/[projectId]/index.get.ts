interface TipTapNode {
  type?: string
  text?: string
  marks?: { type: string; attrs?: { href?: string } }[]
  attrs?: { level?: number; checked?: boolean; href?: string }
  content?: TipTapNode[]
}

export default defineEventHandler<Promise<DetailedProject>>(async (event) => {
  try {
    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))

    if (!projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })
    }

    const projectStorage = useStorage<Resource<'project'>>('data:resource:project')
    const item = await projectStorage.getItem<{ record: Record<string, unknown> }>(projectId)
    const record = item?.record as { id: string; properties?: Record<string, unknown> } | undefined

    if (!record || !record.properties) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const props = record.properties as Record<string, unknown>
    const deliverableRelation = (props.Deliverables as { relation?: { id: string }[] })?.relation || []
    const deliverableIds = deliverableRelation.map((r) => notionNormalizeId(r.id) as string)
    let deliverables: ProjectDeliverable[] = []

    if (deliverableIds.length > 0) {
      const deliverableStorage = useStorage<Resource<'deliverable'>>('data:resource:deliverable')
      const items = (await Promise.all(deliverableIds.map((id) => deliverableStorage.getItem<{ record: { id: string; properties: Record<string, unknown> } }>(id)))).filter(
        (i): i is { record: { id: string; properties: Record<string, unknown> } } => !!i
      )

      deliverables = items.map(({ record: { id, properties: dProps } }) => {
        const titleProp = dProps.Title as { title?: { plain_text: string }[] }
        const qtyProp = dProps.Quantity as { number?: number | null }
        const rateProp = dProps.Rate as { number?: number | null }
        const descProp = dProps.Description as { rich_text?: { text: { content: string } }[] }
        const pointsProp = dProps.Points as { multi_select?: { name: string }[] }

        return {
          id,
          title: titleProp?.title?.[0]?.plain_text || 'Untitled Deliverable',
          quantity: qtyProp?.number ?? undefined,
          rate: rateProp?.number ?? undefined,
          description: descProp?.rich_text?.[0]?.text?.content || undefined,
          points: pointsProp?.multi_select?.map((p) => p.name) || undefined,
        }
      })
    }

    const nameProp = props.Name as { title?: { plain_text: string }[] }
    const indexProp = props.Index as { number?: number }
    const slugProp = props.Slug as { formula?: { string: string } }
    const statusProp = props.Status as { status?: { name: ProjectStatus } }
    const addressProp = props.Address as { rich_text?: { text: { content: string } }[] }
    const dateProp = props.Date as { date?: { start: string } }
    const quoteProp = props.Quotation as { number?: number }
    const budgetProp = props.Budget as { number?: number }

    const projectContentStorage = useStorage<Record<string, Record<string, unknown>>>('data:resource:project:content')
    let additionalContent: string | Record<string, unknown> | null = await projectContentStorage.getItem(projectId)

    if (!additionalContent) {
      const blocks = await notion.blocks.children.list({ block_id: record.id })
      const rawJsonString = blocks.results.map((b) => ('paragraph' in b ? (b as { paragraph?: { rich_text?: { plain_text?: string }[] } }).paragraph?.rich_text?.[0]?.plain_text || '' : '')).join('')
      if (rawJsonString) {
        try {
          additionalContent = JSON.parse(rawJsonString) as Record<string, unknown>
          await projectContentStorage.setItem(projectId, additionalContent)
        } catch {
          additionalContent = rawJsonString
        }
      }
    }

    const markdown = additionalContent && typeof additionalContent === 'object' ? tiptapToMarkdown(additionalContent as TipTapNode) : typeof additionalContent === 'string' ? additionalContent : null

    return {
      id: record.id,
      title: nameProp?.title?.[0]?.plain_text || 'Untitled Project',
      index: indexProp?.number,
      slug: slugProp?.formula?.string || record.id,
      status: statusProp?.status?.name || 'Plan',
      segment: undefined,
      shootLocation: addressProp?.rich_text?.[0]?.text?.content,
      shootDate: dateProp?.date?.start?.split('T')[0],
      quoteNumber: quoteProp?.number,
      duration: undefined,
      contactName: undefined,
      budget: budgetProp?.number,
      additional: additionalContent ?? null,
      deliverables,
      markdown,
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch project details' })
  }
})
