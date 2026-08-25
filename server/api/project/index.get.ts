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
        const status = props.Status?.status?.name || 'Plan'

        const statusMap = {
          Plan: 'Plan',
          Quotation: 'Document',
          Shoot: 'Production',
          Edit: 'Post-Production',
          Delivered: 'Delivered',
        } as const

        const startDate = props.Date?.date?.start ? new Date(props.Date.date.start) : new Date()
        const endDate = props.Date?.date?.end ? new Date(props.Date.date.end) : new Date(startDate.getTime() + 86400000)

        projects.push({
          id: slug,
          index: props.Index?.number || Math.floor(Math.random() * 100),
          title: name,
          status: statusMap[status] || 'Plan',
          progress: props.Index?.number ? Math.min(props.Index.number * 2, 100) : 45,
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          previews: ['/images/bg-texture-teal.webp', '/images/bg-texture-purple.webp', '/images/bg-texture-green.webp', '/images/bg-texture-orange.webp'],
          assignees: ['/pwa/icon-48.png', '/pwa/icon-48.png'],
        })
      })
    )

    return projects.toSorted((a, b) => {
      return new Date(b.period.start).getTime() - new Date(a.period.start).getTime()
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
