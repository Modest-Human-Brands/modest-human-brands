export default defineCachedEventHandler<Promise<ProjectDetail | undefined>>(
  async (event) => {
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

    const asset = (await notionQueryDb<NotionAsset>(notion, notionDbId.asset)).filter((a) => !!a)
    const project = (await notionQueryDb<NotionProject>(notion, notionDbId.project)).filter((a) => !!a)

    const mediaItems = await $fetch<MediaItem[]>('/api/media', {
      baseURL: 'http://localhost:3045',
    })

    const filteredProject = project.filter(({ properties }) => properties.Slug.formula.string === slug)[0]

    if (!filteredProject) return

    const projectAssets = asset.filter((asset) => asset.properties['Project Slug'].rollup.array[0]?.formula.string === filteredProject.properties.Slug.formula.string)

    const photoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Photo')
    const videoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Video')

    const projectMediaItems = mediaItems.filter(({ slug }) => projectAssets.findIndex(({ properties }) => properties.Slug.formula.string === slug) !== -1)

    return {
      slug: filteredProject.properties.Slug.formula.string,
      title: notionTextStringify(filteredProject.properties.Name.title),
      date: filteredProject.properties.Date.date.start,
      status: filteredProject.properties.Status.status.name,
      client: {
        name: 'True Mens',
        avatarUrl: 'https://picsum.photos/seed/dfas/72/72',
      },
      mediaCount: {
        photo: photoAsset.length,
        video: videoAsset.length,
      },
      mediaItems: projectMediaItems,
    } as ProjectDetail
  },
  { maxAge: 60 * 1, swr: true }
)
