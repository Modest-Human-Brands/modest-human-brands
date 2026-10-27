import z from 'zod'

const bodySchema = z.object({ stage: z.enum(projectStages) })

export default defineEventHandler<Promise<{ id: string; status: ProjectStatus; progress: number }>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))
    if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })

    const { stage } = await readValidatedBody(event, bodySchema.parse)

    const projectStorage = useStorage<Resource<'project'>>('data:resource:project')
    const record = (await projectStorage.getItem(projectId))?.record as { id: string; last_edited_time: Date; properties?: Record<string, unknown> } | undefined

    if (!record?.properties) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

    assertProjectInOrg(record, getActiveOrgId(event, user))

    // Notion first, so the cache never claims a stage Notion rejected
    await notion.pages.update({ page_id: record.id, properties: { Status: { status: { name: toNotionStatus(stage) } } } })

    record.properties.Status = { type: 'status', status: { name: toNotionStatus(stage) } }
    record.last_edited_time = new Date()
    await projectStorage.setItem(projectId, { record } as never)

    return { id: record.id, status: stage, progress: projectProgress(stage) }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    console.error('API project/[projectId]/stage PUT', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to change the project stage' })
  }
})
