import z from 'zod'

const bodySchema = z.object({ name: z.string().trim().max(200).default('') })

export default defineEventHandler<Promise<ProjectCrewMember>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))
    if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })

    const { name } = await readValidatedBody(event, bodySchema.parse)

    const project = (await useStorage<Resource<'project'>>('data:resource:project').getItem(projectId))?.record
    assertProjectInOrg(project, getActiveOrgId(event, user))

    const rawDbId = useRuntimeConfig().private.notionDbId
    const crewDbId = (typeof rawDbId === 'string' ? (JSON.parse(rawDbId) as NotionDB) : (rawDbId as unknown as NotionDB)).crew
    if (!crewDbId) throw createError({ statusCode: 503, statusMessage: 'Crew database is not configured' })

    // A new row is created empty, like in Notion; it starts as Contacted (the Status default) and is filled in place
    const page = (await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: crewDbId },
      properties: {
        Name: { title: name ? [{ text: { content: name } }] : [] },
        Project: { relation: [{ id: project!.id }] },
      },
    })) as unknown as NotionCrew

    await useStorage<Resource<'crew'>>('data:resource:crew').setItem(notionNormalizeId(page.id)!, { type: 'crew', notificationStatus: false, record: page })

    return mapCrewMember(page)
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    console.error('API project/[projectId]/crew POST', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to add crew member' })
  }
})
