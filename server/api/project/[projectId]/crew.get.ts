export default defineEventHandler<Promise<ProjectCrewMember[]>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))
    if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Project ID is required' })

    const projectItem = await useStorage<Resource<'project'>>('data:resource:project').getItem(projectId)
    assertProjectInOrg(projectItem?.record, getActiveOrgId(event, user))

    const storage = useStorage<Resource<'crew'>>('data:resource:crew')
    const keys = await storage.getKeys()
    const records = (await Promise.all(keys.map((key) => storage.getItem(key)))).map((item) => item?.record).filter((record): record is NonNullable<typeof record> => !!record?.properties)

    return records
      .filter((record) => (record.properties.Project?.relation ?? []).some(({ id }) => notionNormalizeId(id) === projectId))
      .map(mapCrewMember)
      .toSorted((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    console.error('API project/[projectId]/crew GET', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch project crew' })
  }
})
