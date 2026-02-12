export default defineCachedEventHandler<Promise<DriveFolder[]>>(
  async () => {
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const asset = (await notionQueryDb<NotionAsset>(notion, notionDbId.asset)).filter((a) => !!a)
    const project = (await notionQueryDb<NotionProject>(notion, notionDbId.project)).filter((a) => !!a)

    return project
      .map(({ properties }) => {
        const projectAssets = asset.filter((asset) => asset.properties['Project Slug'].rollup.array[0]?.formula.string === properties.Slug.formula.string)

        const photoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Photo')
        const videoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Video')
        return {
          slug: properties.Slug.formula.string,
          title: notionTextStringify(properties.Name.title),
          date: properties.Date.date.start,
          status: properties.Status.status.name,
          client: {
            name: 'True Mens',
            avatarUrl: 'https://picsum.photos/seed/dfas/72/72',
          },
          mediaCount: {
            photo: photoAsset.length,
            video: videoAsset.length,
          },
          previewImages: projectAssets.map(({ cover }) => (cover?.type === 'external' ? cover.external.url : undefined)),
        } as DriveFolder
      })
      .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
  { maxAge: 60 * 1, swr: true }
)
