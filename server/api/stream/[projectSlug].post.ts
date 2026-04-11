import { generateCover } from './index.get'

export default defineEventHandler<Promise<ProjectStreamCollection | undefined>>(async (event) => {
  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')
  const { deviceId } = await readBody<{ deviceId: string }>(event)

  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
  const color = { primary: 'CD2D2D', accent: '262626' }

  const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)
  const project = projects.find((p) => p.properties.Slug.formula.string === slug)

  if (!project) return

  const config = useRuntimeConfig()
  const { properties, cover } = project

  const [stream] = await Promise.all([
    $fetch<ProjectStream>(`${config.private.mediaUrl}/stream/start`, {
      method: 'POST',
      body: { slug, deviceId },
    }).catch(() => null),
  ])

  const coverUrl = cover?.type === 'external' ? cover.external.url : generateCover(slug, [color.primary, color.accent])

  const result: ProjectStreamCollection = {
    slug,
    title: notionTextStringify(properties.Name.title),
    poster: coverUrl,
    createdAt: properties.Date.date.start,
    status: stream?.status ?? StreamStatus.Idle,
    streams: [
      {
        deviceId,
        streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
        media: `live/${slug}_${deviceId}/master.m3u8`,
        status: stream?.status ?? StreamStatus.Idle,
        poster: generateCover(slug + deviceId, [color.primary, color.accent]),
        createdAt: properties.Date.date.start,
      },
    ],
  }

  return result
})
