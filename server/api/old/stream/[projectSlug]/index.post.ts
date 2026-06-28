import { generateCover } from '../index.get'

export default defineEventHandler<Promise<ProjectStreamCollection | undefined>>(async (event) => {
  try {
    const { user } = await getUserSession(event)

    const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')
    const { deviceId } = await readBody<{ deviceId: string }>(event)

    const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
    const color = { primary: 'CD2D2D', accent: '262626' }

    const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)
    const project = projects.find((p) => p.properties.Slug.formula.string === slug)

    if (!project) return

    const { properties, cover } = project
    // const config = useRuntimeConfig()

    // create ingress

    // const stream = await $fetch<ProjectStream>(`${config.private.mediaUrl}/stream/start`, {
    //   method: 'POST',
    //   body: { slug, deviceId },
    // }).catch(() => null)

    const coverUrl = cover?.type === 'external' ? cover.external.url : generateCover(slug, [color.primary, color.accent])

    streamStore.set(slug, { title: deviceId, createdAt: Date.now() })

    const token = user
      ? await createToken(
          `host-${slug}_${deviceId}`, // identity — "host-" prefix so viewers can distinguish
          deviceId, // display name
          slug, // room name = slug
          true // canPublish
        )
      : await createToken(
          `viewer-${crypto.randomUUID().slice(0, 8)}`,
          `Viewer ${`viewer-${crypto.randomUUID().slice(0, 8)}`.slice(-4)}`,
          slug,
          false // canPublish = false
        )

    const result: ProjectStreamCollection = {
      slug,
      title: notionTextStringify(properties.Name.title),
      poster: coverUrl,
      date: properties.Date.date.start,
      status: StreamStatus.Ready ?? StreamStatus.Idle,
      streams: [
        {
          deviceId,
          streamUrl: `srt://${import.meta.env.MOTIA_SRT_HOST}:${import.meta.env.MOTIA_SRT_PORT}?streamid=live/${slug}/${deviceId}`,
          streamKey: '',
          media: `live/${slug}_${deviceId}/master.m3u8`,
          status: StreamStatus.Ready ?? StreamStatus.Idle,
          token,
          poster: generateCover(slug + deviceId, [color.primary, color.accent]),
          createdAt: properties.Date.date.start,
        },
      ],
    }

    return result
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API stream/[projectSlug] POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
