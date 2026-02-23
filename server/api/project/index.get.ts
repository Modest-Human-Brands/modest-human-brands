export default defineEventHandler<Promise<Project[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const assetStorage = useStorage<Resource<'asset'>>(`data:resource:asset`)
  const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
  const clientStorage = useStorage<Resource<'client'>>(`data:resource:client`)

  const assets = (await assetStorage.getItems(await assetStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((a) => a?.properties && a.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)
  const projects = (await projectStorage.getItems(await projectStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((p) => p?.properties && p.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)
  const clients = (await clientStorage.getItems(await clientStorage.getKeys()))
    .flatMap(({ value }) => value.record)
    .filter((c) => c?.properties && c.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)

  return projects
    .map(({ properties }) => {
      const projectAssets = assets.filter((asset) => asset.properties['Project Slug'].rollup.array[0]?.formula.string === properties.Slug.formula.string)

      const photoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Photo')
      const videoAsset = projectAssets.filter((asset) => asset.properties.Type.select.name === 'Video')
      const projectClient = clients.find((c) => c.id === properties.Client.relation[0]?.id)

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
