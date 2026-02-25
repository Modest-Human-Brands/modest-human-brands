export default defineEventHandler<Promise<Stream[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)

  // const config = useRuntimeConfig()
  // const streams = await $fetch<Stream[]>(`${config.public.driveUrl}/stream`)
  const deviceId = 'front-camera'

  const projects = (await projectStorage.getItems(await projectStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((p) => p?.properties && p.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)

  return projects.map<Stream>(({ properties, cover }) => {
    const slug = properties.Slug.formula.string
    const coverUrl = cover?.type === 'external' ? cover.external.url : `https://placehold.co/1280x720?text=${encodeURIComponent(slug)}`

    return {
      slug,
      title: notionTextStringify(properties.Name.title),
      deviceId,
      streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}/live/${slug}/${deviceId}`,
      media: coverUrl,
      poster: coverUrl,
      isLive: properties.Status.status.name === 'Shoot',
    }
  })
})
