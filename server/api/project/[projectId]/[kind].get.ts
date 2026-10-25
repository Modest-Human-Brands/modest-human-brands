import z from 'zod'

const paramsSchema = z.object({
  projectId: z.string().min(1),
  kind: z.enum(projectItemKinds),
})

export default defineEventHandler<Promise<ProjectItem[]>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const { projectId: rawProjectId, kind } = await getValidatedRouterParams(event, paramsSchema.parse)
    const projectId = notionNormalizeId(rawProjectId)

    const projectItem = await useStorage<Resource<'project'>>('data:resource:project').getItem(projectId!)
    assertProjectInOrg(projectItem?.record, getActiveOrgId(event, user))

    const storage = useStorage<Resource<ProjectItemKind>>(`data:resource:${kind}`)
    const keys = await storage.getKeys()
    const records = (await Promise.all(keys.map((key) => storage.getItem(key)))).map((item) => item?.record).filter((record): record is NonNullable<typeof record> => !!record?.properties)

    const projectRecords = records.filter((record) => projectItemProjectIds(record).includes(projectId!))
    const items = await Promise.all(projectRecords.map((record) => mapProjectItem(record)))

    return items.toSorted((a, b) => a.index - b.index)
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API project/[projectId]/[kind] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
