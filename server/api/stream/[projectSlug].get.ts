export default defineEventHandler<Promise<ProjectStreamCollection | undefined>>(async (event) => {
  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
  const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)
  const project = projects.find((p) => p.properties.Slug.formula.string === slug)

  if (!project) return

  const config = useRuntimeConfig()

  const [allStreams, { properties, cover }] = await Promise.all([
    $fetch<{ slug: string; deviceId: string; status: StreamStatus }[]>(`${config.public.driveUrl}/stream`).catch(() => []),
    Promise.resolve(project),
  ])

  console.log({ allStreams })
  const projectStreams = allStreams
    .filter((s) => s.slug.startsWith(slug))
    .map((s) => ({
      ...s,
      deviceId: s.deviceId ?? s.slug.slice(slug.length + 1), // extract from "slug-deviceId"
    }))
    .filter((s, i, arr) => arr.findIndex((x) => x.deviceId === s.deviceId) === i) // dedupe
  console.log({ projectStreams })
  const deviceIds = projectStreams.length ? projectStreams.map((s) => s.deviceId) : ['front-camera']

  const coverUrl = cover?.type === 'external' ? cover.external.url : `https://placehold.co/1280x720?text=${encodeURIComponent(slug)}`

  return {
    slug,
    title: notionTextStringify(properties.Name.title),
    poster: coverUrl,
    streams: deviceIds.map<ProjectStream>((deviceId) => {
      const current = projectStreams.find((s) => s.deviceId === deviceId)
      return {
        deviceId,
        streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
        media: `stream/${slug}/${deviceId}/hls/master.m3u8`,
        status: current?.status ?? StreamStatus.Idle,
      }
    }),
  }
})
