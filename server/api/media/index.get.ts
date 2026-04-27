export default defineEventHandler<Promise<ProjectMediaCollection[]>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const activeOrg = user.organizations[0]

    if (!activeOrg) return []

    const documentStorage = useStorage<Resource<'media'>>(`data:resource:media`)
    const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
    const clientStorage = useStorage<Resource<'client'>>(`data:resource:client`)

    const assets = (await documentStorage.getItems(await documentStorage.getKeys()))
      .flatMap(({ value }) => value.record)
      .filter((a) => a?.properties && a.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)
    const projects = (await projectStorage.getItems(await projectStorage.getKeys()))
      .flatMap(({ value }) => value.record)
      .filter((p) => p?.properties && p.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)
    const clients = (await clientStorage.getItems(await clientStorage.getKeys()))
      .flatMap(({ value }) => value.record)
      .filter((c) => c?.properties && c.properties?.Organization.relation.findIndex(({ id }) => id === activeOrg) !== -1)

    return projects
      .map<ProjectMediaCollection>(({ properties }) => {
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
          previewImages: projectAssets.map(({ cover }) => (cover?.type === 'external' ? cover.external.url : undefined)).filter((value) => value !== undefined),
        }
      })
      .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API media GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
