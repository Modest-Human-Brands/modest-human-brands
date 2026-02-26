export default defineEventHandler<Promise<ProjectStream | undefined>>(async (event) => {
  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)

  const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)

  const project = projects.find((p) => p.properties.Slug.formula.string === slug)

  if (!project) return

  const config = useRuntimeConfig()
  const deviceId = 'front-camera'
  const stream = await $fetch<ProjectStream>(`${config.public.driveUrl}/stream/${slug}/${deviceId}`)

  const { properties, cover } = project
  const coverUrl = cover?.type === 'external' ? cover.external.url : `https://placehold.co/1280x720?text=${encodeURIComponent(slug)}`

  return {
    slug,
    title: notionTextStringify(properties.Name.title),
    deviceId,
    streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
    media: `stream/${slug}/${deviceId}/hls/master.m3u8`,
    poster: coverUrl,
    status: stream?.status ?? StreamStatus.Idle,
  }
})
