import { generateCover } from './index.get'

export default defineEventHandler<Promise<ProjectStreamCollection | undefined>>(async (event) => {
  try {
    const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

    const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
    const color = { primary: 'CD2D2D', accent: '262626' }

    const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)
    const project = projects.find((p) => p.properties.Slug.formula.string === slug)

    if (!project) return

    const config = useRuntimeConfig()

    const allStreams = await $fetch<{ slug: string; deviceId: string; status: StreamStatus }[]>(`${config.private.mediaUrl}/stream`).catch(() => [])

    const projectStreams = allStreams.filter((s) => s.slug.startsWith(slug))

    const deviceIds = projectStreams.map((s) => s.deviceId)

    const coverUrl = project.cover?.type === 'external' ? project.cover.external.url : generateCover(slug, [color.primary, color.accent])

    const result: ProjectStreamCollection = {
      slug,
      title: notionTextStringify(project.properties.Name.title),
      poster: coverUrl,
      date: project.properties.Date.date.start,
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
          createdAt: project.properties.Date.date.start,
        }
      }),
    }

    return result
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API stream/[projectSlug] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
