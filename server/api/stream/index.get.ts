export default defineEventHandler<Promise<ProjectStreamCollection[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
  const clientStorage = useStorage<Resource<'client'>>(`data:resource:client`)

  const projects = (await projectStorage.getItems(await projectStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((p) => p?.properties && p.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)
  const clients = (await clientStorage.getItems(await clientStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((c) => c?.properties && c.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)

  const config = useRuntimeConfig()
  const streams = await $fetch<{ slug: string; status: StreamStatus }[]>(`${config.public.driveUrl}/stream`)

  return projects
    .map<ProjectStreamCollection>(({ properties, cover }) => {
      const slug = properties.Slug.formula.string
      const coverUrl = cover?.type === 'external' ? cover.external.url : `https://api.dicebear.com/9.x/glass/svg?seed=${slug}`

      const projectStreams = streams
        .filter((s) => s.slug.startsWith(slug))
        .map(({ slug, status }) => {
          const deviceId = slug.split(':').at(-1)!
          return {
            deviceId,
            streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
            media: `stream/${slug}/${deviceId}/hls/master.m3u8`,
            status: status ?? StreamStatus.Idle,
          }
        })

      const projectClient = clients.find((c) => c.id === properties.Client.relation[0]?.id)

      return {
        slug,
        title: notionTextStringify(properties.Name.title),
        poster: coverUrl,
        date: properties.Date.date.start,
        client: projectClient
          ? {
              name: notionTextStringify(projectClient.properties.Name.title),
              avatar: projectClient.cover?.type === 'external' ? projectClient.cover.external.url : undefined,
            }
          : undefined,
        status: projectStreams.some(({ status }) => status === StreamStatus.Live) ? StreamStatus.Live : StreamStatus.Idle,
        streams: projectStreams,
      }
    })
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})
