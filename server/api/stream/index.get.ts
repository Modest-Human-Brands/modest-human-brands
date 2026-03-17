import tinygradient from 'tinygradient'

export function generateCover(seed: string, colors: string[]): string {
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const angle = (hash * 137) % 360

  const gradient = tinygradient(colors.map((c) => `#${c}`))
  const css = gradient.css('linear', `${angle}deg`)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><foreignObject width="800" height="450"><div xmlns="http://www.w3.org/1999/xhtml" style="width:800px;height:450px;background:${css}"/></foreignObject></svg>`

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export default defineEventHandler<Promise<ProjectStreamCollection[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
  const clientStorage = useStorage<Resource<'client'>>(`data:resource:client`)
  const color = { primary: 'CD2D2D', accent: '262626' }

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

      const coverUrl = cover?.type === 'external' ? cover.external.url : generateCover(slug, [color.primary, color.accent])

      const projectStreams = streams
        .filter((s) => s.slug.startsWith(slug))
        .map(({ slug, status }) => {
          const deviceId = slug.split('-').at(-1)!
          return {
            deviceId,
            streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
            media: `live/${slug}_${deviceId}/master.m3u8`,
            status: status ?? StreamStatus.Idle,
            poster: generateCover(slug + deviceId, [color.primary, color.accent]), //coverUrl + deviceId,
            createdAt: new Date().toISOString(), //properties.Date.date.start
          }
        })

      const projectClient = clients.find((c) => c.id === properties.Client.relation[0]?.id)

      return {
        slug,
        title: notionTextStringify(properties.Name.title),
        poster: coverUrl,
        createdAt: new Date().toISOString(), //properties.Date.date.start
        client: projectClient
          ? {
              name: notionTextStringify(projectClient.properties.Name.title),
              avatar: projectClient.cover?.type === 'external' ? projectClient.cover.external.url : undefined,
            }
          : undefined,
        status: (() => {
          const streams = projectStreams ?? []
          if (streams.some((s) => s.status === StreamStatus.Live)) return StreamStatus.Live
          if (streams.some((s) => s.status === StreamStatus.Starting)) return StreamStatus.Starting
          return streams[0]?.status ?? StreamStatus.Idle
        })(),
        streams: projectStreams,
      }
    })
    .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})
