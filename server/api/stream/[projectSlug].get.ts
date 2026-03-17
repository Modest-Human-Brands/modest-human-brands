import { generateCover } from './index.get'

export default defineEventHandler<Promise<ProjectStreamCollection | undefined>>(async (event) => {
  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
  const color = { primary: 'CD2D2D', accent: '262626' }

  const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)
  const project = projects.find((p) => p.properties.Slug.formula.string === slug)

  if (!project) return

  const config = useRuntimeConfig()

  const [allStreams, { properties, cover }] = await Promise.all([
    $fetch<{ slug: string; deviceId: string; status: StreamStatus }[]>(`${config.public.driveUrl}/stream`).catch(() => []),
    Promise.resolve(project),
  ])

  const projectStreams = allStreams
    .filter((s) => s.slug.startsWith(slug))
    .map((s) => ({
      ...s,
      deviceId: s.deviceId ?? s.slug.slice(slug.length + 1), // extract from "slug:deviceId"
    }))
    .filter((s, i, arr) => arr.findIndex((x) => x.deviceId === s.deviceId) === i) // dedupe

  const deviceIds = projectStreams.length ? projectStreams.map((s) => s.deviceId) : []

  const coverUrl = cover?.type === 'external' ? cover.external.url : generateCover(slug, [color.primary, color.accent])

  const result: ProjectStreamCollection = {
    slug,
    title: notionTextStringify(properties.Name.title),
    poster: coverUrl,
    createdAt: new Date().toISOString(), //properties.Date.date.start
    status: (() => {
      const streams = projectStreams ?? []
      if (streams.some((s) => s.status === StreamStatus.Live)) return StreamStatus.Live
      if (streams.some((s) => s.status === StreamStatus.Starting)) return StreamStatus.Starting
      return streams[0]?.status ?? StreamStatus.Idle
    })(),
    streams: deviceIds.map<ProjectStream>((deviceId) => {
      const current = projectStreams.find((s) => s.deviceId === deviceId)
      return {
        deviceId,
        streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
        media: `live/${slug}_${deviceId}/master.m3u8`,
        status: current?.status ?? StreamStatus.Idle,
        poster: generateCover(slug + deviceId, [color.primary, color.accent]),
        createdAt: new Date().toISOString(), //properties.Date.date.start
      }
    }),
  }

  return result
})
