export default defineEventHandler<Promise<ProjectDetail | undefined>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return

  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

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

  const filteredProject = projects.filter(({ properties }) => properties.Slug.formula.string === slug)[0]

  if (!filteredProject) return

  const projectClient = clients.filter(({ properties }) => properties.Project.relation.findIndex(({ id }) => id === filteredProject.id))[0]
  const projectAssets = assets.filter((a) => a.properties['Project Slug'].rollup.array[0]?.formula.string === filteredProject.properties.Slug.formula.string)

  const photoAsset = projectAssets.filter((a) => a.properties.Type.select.name === 'Photo')
  const videoAsset = projectAssets.filter((a) => a.properties.Type.select.name === 'Video')

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
})
