export default defineEventHandler<Promise<Project[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

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
  const client = (
    await notionQueryDb<NotionProjectClient>(notion, notionDbId.client, {
      filter: {
        property: 'Organization',
        relation: {
          contains: activeOrg,
        },
      },
    })
  ).filter((a) => !!a)

  return project
    .map(({ properties }) => {
      const projectAssets = asset.filter((asset) => asset.properties['Project Slug'].rollup.array[0]?.formula.string === properties.Slug.formula.string)

      const photoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Photo')
      const videoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Video')
      const projectClient = client.find((c) => c.id === properties.Client.relation[0]?.id)

      return {
        slug: properties.Slug.formula.string,
        title: notionTextStringify(properties.Name.title),
        date: properties.Date.date.start,
        status: properties.Status.status.name,
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
        previewImages: projectAssets.map(({ cover }) => (cover?.type === 'external' ? cover.external.url : undefined)),
      } as Project
    })
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})
