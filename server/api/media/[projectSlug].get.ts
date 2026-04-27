export default defineEventHandler<Promise<ProjectDetail | undefined>>(async (event) => {
  try {
    const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

    const documentStorage = useStorage<Resource<'media'>>(`data:resource:media`)
    const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
    const clientStorage = useStorage<Resource<'client'>>(`data:resource:client`)

    const assets = (await documentStorage.getItems(await documentStorage.getKeys())).flatMap(({ value }) => value.record)

    const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)

    const clients = (await clientStorage.getItems(await clientStorage.getKeys())).flatMap(({ value }) => value.record)

    const filteredProject = projects.filter(({ properties }) => properties.Slug.formula.string === slug)[0]

    if (!filteredProject) return

    const projectClient = clients.filter(({ properties }) => properties.Project.relation.some(({ id }) => id === filteredProject.id))[0]
    const projectAssets = assets.filter((a) => a.properties['Project Slug'].rollup.array[0]?.formula.string === filteredProject.properties.Slug.formula.string)

    const photoAsset = projectAssets.filter((a) => a.properties.Type.select.name === 'Photo')
    const videoAsset = projectAssets.filter((a) => a.properties.Type.select.name === 'Video')

    const projectMediaItems = projectAssets
      .map<MediaItem>(({ properties, cover }) => ({
        slug: properties.Slug.formula.string,
        title: notionTextStringify(properties.Name.title),
        type: properties.Type.select.name.toLowerCase() as 'photo' | 'video',
        thumbnailUrl: cover?.type === 'external' ? cover.external.url : undefined,
        media: properties.Type.select.name.toLowerCase() === 'video' ? `media/video/s_720-1080/${properties.Slug.formula.string}.mpd` : undefined,
        metadata: {
          size: 22,
          bitDepth: '10 bit',
          resolution: properties.Resolution.select.name,
          aspectRatio: properties['Aspect ratio'].select.name,
          fps: properties.Type.select.name.toLowerCase() === 'video' ? 30 : undefined,
        },
        // uploadDate:'',
        // url:'',
      }))
      .toSorted((a, b) => a.slug.localeCompare(b.slug))

    return {
      slug: filteredProject.properties.Slug.formula.string,
      title: notionTextStringify(filteredProject.properties.Name.title),
      date: filteredProject.properties.Date.date.start,
      status: filteredProject.properties.Status.status.name,
      client: projectClient
        ? {
            name: notionTextStringify(projectClient.properties.Name.title),
            avatar: projectClient.cover?.type === 'external' ? projectClient.cover.external.url : undefined,
          }
        : undefined,
      mediaCount: {
        photo: photoAsset.length,
        video: videoAsset.length,
      },
      mediaItems: projectMediaItems,
    } as ProjectDetail
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API media/[projectSlug] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
