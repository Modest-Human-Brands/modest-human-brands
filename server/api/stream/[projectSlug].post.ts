export default defineEventHandler<Promise<ProjectStreamCollection | undefined>>(async (event) => {
  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')
  const { deviceId } = await readBody<{ deviceId: string }>(event)

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
  const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)
  const project = projects.find((p) => p.properties.Slug.formula.string === slug)

  if (!project) return

  const config = useRuntimeConfig()
  const { properties, cover } = project

  const [stream] = await Promise.all([
    $fetch<ProjectStream>(`${config.public.driveUrl}/stream/start`, {
      method: 'POST',
      body: { slug, deviceId },
    }).catch(() => null),
  ])

  const coverUrl = cover?.type === 'external' ? cover.external.url : `https://api.dicebear.com/9.x/glass/svg?seed=${slug}`

  return {
    slug,
    title: notionTextStringify(properties.Name.title),
    poster: coverUrl,
    streams: [
      {
        deviceId,
        streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
        media: `stream/${slug}/${deviceId}/hls/master.m3u8`,
        status: stream?.status ?? StreamStatus.Starting,
      },
    ],
  }
})
