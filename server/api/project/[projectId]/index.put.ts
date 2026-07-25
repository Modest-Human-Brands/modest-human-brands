import type { DetailedProject, ProjectStatus } from './index.get'

export default defineEventHandler<Promise<DetailedProject>>(async (event) => {
  try {
    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))

    if (!projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })
    }

    const body = await readBody<DetailedProject>(event)
    const projectStorage = useStorage<Resource<'project'>>('data:resource:project')
    const deliverableStorage = useStorage<Resource<'deliverable'>>('data:resource:deliverable')
    const docStorage = useStorage<Record<string, Record<string, unknown>>>('data:resource:project:content')

    const item = await projectStorage.getItem<{ record: Record<string, unknown> }>(projectId)
    const record = item?.record as { id: string; last_edited_time: Date; properties: Record<string, unknown> } | undefined

    if (!record || !record.properties) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const props = record.properties as Record<string, unknown>
    const notionProperties: Record<string, unknown> = {}

    if (body.title !== undefined) {
      props.Name = { type: 'title', title: [{ plain_text: body.title }] }
      notionProperties.Name = { title: [{ text: { content: body.title } }] }
    }
    if (body.index !== undefined) {
      props.Index = { type: 'number', number: Number(body.index) || 0 }
      notionProperties.Index = { number: Number(body.index) || 0 }
    }
    if (body.status !== undefined) {
      props.Status = { type: 'status', status: { name: body.status as ProjectStatus } }
      notionProperties.Status = { status: { name: body.status as ProjectStatus } }
    }
    if (body.shootLocation !== undefined) {
      props.Address = { type: 'rich_text', rich_text: [{ text: { content: body.shootLocation } }] }
      notionProperties.Address = { rich_text: [{ text: { content: body.shootLocation } }] }
    }
    if (body.shootDate !== undefined) {
      props.Date = { type: 'date', date: { start: body.shootDate, end: body.shootDate } }
      notionProperties.Date = { date: { start: body.shootDate, end: body.shootDate } }
    }
    if (body.budget !== undefined) {
      props.Budget = { type: 'number', number: Number(body.budget) || 0 }
      notionProperties.Budget = { number: Number(body.budget) || 0 }
    }
    if (body.quoteNumber !== undefined) {
      props.Quotation = { type: 'number', number: Number(body.quoteNumber) || 0 }
      notionProperties.Quotation = { number: Number(body.quoteNumber) || 0 }
    }

    if (body.additional !== undefined && body.additional !== null) {
      const oldBlocks = await notion.blocks.children.list({ block_id: record.id })
      await Promise.all(oldBlocks.results.map((block) => notion.blocks.delete({ block_id: block.id })))

      const jsonString = typeof body.additional === 'string' ? body.additional : JSON.stringify(body.additional)
      const chunks = jsonString.match(/.{1,2000}/g) || []
      const newBlocks = chunks.map((chunk) => ({
        object: 'block' as const,
        type: 'paragraph' as const,
        paragraph: { rich_text: [{ type: 'text' as const, text: { content: chunk } }] },
      }))

      if (newBlocks.length > 0) {
        await notion.blocks.children.append({
          block_id: record.id,
          children: newBlocks,
        })
      }

      if (typeof body.additional === 'object') {
        await docStorage.setItem(projectId, body.additional as Record<string, unknown>)
      } else if (typeof body.additional === 'string') {
        await docStorage.setItem(projectId, { content: body.additional })
      }
    }

    let deliverablesDbId = process.env.NOTION_DELIVERABLES_DB_ID || ''
    if (!deliverablesDbId) {
      const keys = await deliverableStorage.getKeys()
      for (const key of keys) {
        const existing = await deliverableStorage.getItem<{ record: Record<string, unknown> }>(key)
        const parent = existing?.record?.parent as { type?: string; database_id?: string } | undefined
        if (parent && parent.database_id) {
          deliverablesDbId = parent.database_id
          break
        }
      }
    }

    const updatedDeliverableIds: string[] = []
    const validNotionRelationIds: { id: string }[] = []
    const deliverablesList = body.deliverables || []

    for (const dItem of deliverablesList) {
      let targetId = dItem.id || ''

      if (targetId && targetId.length === 36 && !targetId.startsWith('local-')) {
        try {
          await notion.pages.update({
            page_id: targetId,
            properties: {
              Title: { title: [{ text: { content: dItem.title || 'Untitled Deliverable' } }] },
              Description: { rich_text: [{ text: { content: dItem.description || '' } }] },
              Points: { multi_select: (dItem.points || []).map((name) => ({ name })) },
              Quantity: { number: dItem.quantity !== undefined ? Number(dItem.quantity) : null },
              Rate: { number: dItem.rate !== undefined ? Number(dItem.rate) : null },
              Project: { relation: [{ id: record.id }] },
            },
          })
          validNotionRelationIds.push({ id: targetId })
          updatedDeliverableIds.push(targetId)
        } catch {
          // Silent catch to continue processing remaining items
        }
      } else if (deliverablesDbId) {
        try {
          const newPage = await notion.pages.create({
            parent: { database_id: deliverablesDbId },
            properties: {
              Title: { title: [{ text: { content: dItem.title || 'Untitled Deliverable' } }] },
              Description: { rich_text: [{ text: { content: dItem.description || '' } }] },
              Points: { multi_select: (dItem.points || []).map((name) => ({ name })) },
              Quantity: { number: dItem.quantity !== undefined ? Number(dItem.quantity) : null },
              Rate: { number: dItem.rate !== undefined ? Number(dItem.rate) : null },
              Project: { relation: [{ id: record.id }] },
            },
          })
          dItem.id = newPage.id
          targetId = newPage.id
          validNotionRelationIds.push({ id: newPage.id })
          updatedDeliverableIds.push(newPage.id)
        } catch {
          // Silent catch if Notion creation fails
        }
      } else {
        targetId = targetId || crypto.randomUUID()
        updatedDeliverableIds.push(targetId)
      }

      const storageKey = notionNormalizeId(targetId) || targetId
      const existingD = await deliverableStorage.getItem<{ record: Record<string, unknown> }>(storageKey)
      const dRecord = (existingD?.record || {
        id: targetId,
        created_time: new Date().toISOString(),
        properties: {},
      }) as { id: string; created_time: string; last_edited_time: string; properties: Record<string, unknown> }

      const dProps = dRecord.properties
      dProps.Title = { type: 'title', title: [{ plain_text: dItem.title || 'Untitled Deliverable' }] }
      dProps.Description = { type: 'rich_text', rich_text: [{ text: { content: dItem.description || '' } }] }
      dProps.Points = { type: 'multi_select', multi_select: (dItem.points || []).map((p) => ({ name: p })) }
      dProps.Quantity = { type: 'number', number: dItem.quantity !== undefined ? Number(dItem.quantity) : null }
      dProps.Rate = { type: 'number', number: dItem.rate !== undefined ? Number(dItem.rate) : null }
      dProps.Project = { type: 'relation', relation: [{ id: projectId }], has_more: false }

      dRecord.last_edited_time = new Date().toISOString()
      await deliverableStorage.setItem(storageKey, { record: dRecord })
    }

    props.Deliverables = {
      type: 'relation',
      relation: updatedDeliverableIds.map((id) => ({ id })),
      has_more: false,
    }

    if (validNotionRelationIds.length > 0) {
      notionProperties.Deliverables = {
        relation: validNotionRelationIds,
      }
    }

    record.last_edited_time = new Date()
    await projectStorage.setItem(projectId, { record })

    await notion.pages.update({
      page_id: record.id,
      properties: notionProperties,
    })

    return body
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to update project details' })
  }
})
