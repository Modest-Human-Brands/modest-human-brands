import type { Project } from '~~/server/api/project/[projectId]/index.get'

export default defineEventHandler(async (_event) => {
  try {
    // await requireUserSession(event)

    const projectStorage = useStorage<Resource<'project'>>('data:resource:project')
    const keys = await projectStorage.getKeys()

    const projects: Project[] = []

    await Promise.all(
      keys.map(async (key) => {
        const record = (await projectStorage.getItem(key))?.record
        if (!record || !record.properties) return

        const props = record.properties
        const name = props.Name?.title?.[0]?.plain_text || 'Untitled Project'
        const slug = props.Slug?.formula?.string || record.id

        projects.push({
          id: record.id,
          title: name,
          slug,
          status: (props.Status?.status?.name as ProjectStatus) || 'Plan',
          shootLocation: props.Address?.rich_text?.[0]?.text?.content || undefined,
          shootDate: props.Date?.date?.start || undefined,
        })
      })
    )

    return projects.toSorted((a, b) => {
      if (a.shootDate && b.shootDate) {
        return new Date(b.shootDate).getTime() - new Date(a.shootDate).getTime()
      }
      return 0
    })
  } catch (error) {
    console.error('API /project/index GET', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch project registry',
    })
  }
})
