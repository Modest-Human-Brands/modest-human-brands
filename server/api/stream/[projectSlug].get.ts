export default defineEventHandler<Promise<Stream | undefined>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return

  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)

  const projects = (await projectStorage.getItems(await projectStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((p) => p?.properties && p.properties?.Organization.relation.some(({ id }) => id === activeOrg))

  const project = projects.find((p) => p.properties.Slug.formula.string === slug)

  if (!project) return

  // const config = useRuntimeConfig()
  // const streams = await $fetch<Stream[]>(`${config.public.driveUrl}/stream`)
  const deviceId = 'front-camera'

  const { properties, cover } = project
  const coverUrl = cover?.type === 'external' ? cover.external.url : `https://placehold.co/1280x720?text=${encodeURIComponent(slug)}`

  return {
    slug,
    title: notionTextStringify(properties.Name.title),
    deviceId,
    streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
    media: `stream/${slug}/${deviceId}/hls/master.m3u8`,
    poster: coverUrl,
    isLive: properties.Status.status.name === 'Shoot',
  }
})
