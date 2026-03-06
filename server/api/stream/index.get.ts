export default defineEventHandler<Promise<ProjectStreamCollection[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)

  const config = useRuntimeConfig()

  const projects = (await projectStorage.getItems(await projectStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((p) => p?.properties && p.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)
    .toSorted((a, b) => new Date(b.properties.Date.date.start).getTime() - new Date(a.properties.Date.date.start).getTime())

  const streams = await $fetch<{ slug: string; deviceId: string; status: StreamStatus }[]>(`${config.public.driveUrl}/stream`)

  return projects.map<ProjectStreamCollection>(({ properties, cover }) => {
    const slug = properties.Slug.formula.string
    const coverUrl = cover?.type === 'external' ? cover.external.url : `https://placehold.co/1280x720?text=${encodeURIComponent(slug)}`

    const projectStreams = streams.filter((s) => s.slug === slug)
    const deviceIds = projectStreams.length ? projectStreams.map((s) => s.deviceId) : []

    return {
      slug,
      title: notionTextStringify(properties.Name.title),
      poster: coverUrl,
      streams: deviceIds.map<ProjectStream>((deviceId) => {
        const currentStream = projectStreams.find((s) => s.deviceId === deviceId)
        return {
          deviceId,
          streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
          media: `stream/${slug}/${deviceId}/hls/master.m3u8`,
          status: currentStream?.status ?? StreamStatus.Idle,
        }
      }),
    }
  })
})
