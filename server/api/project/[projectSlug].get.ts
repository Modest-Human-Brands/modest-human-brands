export default defineEventHandler<Promise<ProjectDetail | undefined>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return

  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

  const asset = (
    await notionQueryDb<NotionAsset>(notion, notionDbId.asset, {
      filter: {
        property: 'Organization',
        relation: {
          contains: activeOrg,
        },
      },
    })
  ).filter((a) => !!a)
  const project = (
    await notionQueryDb<NotionProject>(notion, notionDbId.project, {
      filter: {
        property: 'Organization',
        relation: {
          contains: activeOrg,
        },
      },
    })
  ).filter((a) => !!a)

  const filteredProject = project.filter(({ properties }) => properties.Slug.formula.string === slug)[0]

  if (!filteredProject) return

  const projectAssets = asset.filter((asset) => asset.properties['Project Slug'].rollup.array[0]?.formula.string === filteredProject.properties.Slug.formula.string)

  const photoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Photo')
  const videoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Video')

  const projectMediaItems = projectAssets
    .map<MediaItem>(({ properties, cover }) => ({
      slug: properties.Slug.formula.string,
      title: notionTextStringify(properties.Name.title),
      type: properties.Type.select.name.toLowerCase() as 'photo' | 'video',
      thumbnailUrl: cover?.type === 'external' ? cover.external.url : undefined,
      metadata: {
        size: 22,
        bitDepth: '10 bit',
        resolution: '1080p',
        fps: properties.Type.select.name.toLowerCase() === 'video' ? 30 : undefined,
      },
    }))
    .toSorted((a, b) => a.slug.localeCompare(b.slug))

  return {
    slug: filteredProject.properties.Slug.formula.string,
    title: notionTextStringify(filteredProject.properties.Name.title),
    date: filteredProject.properties.Date.date.start,
    status: filteredProject.properties.Status.status.name,
    client: {
      name: 'True Mens',
      avatar: 'https://picsum.photos/seed/dfas/72/72',
    },
    mediaCount: {
      photo: photoAsset.length,
      video: videoAsset.length,
    },
    mediaItems: projectMediaItems,
  } as ProjectDetail
})
