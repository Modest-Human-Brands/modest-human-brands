export default defineTask({
  meta: {
    name: 'sync:asset',
    description: 'Sync Asset with Project',
  },
  async run() {
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const [notionAssets, notionProjects] = await Promise.all([notionQueryDb<NotionAsset>(notion, notionDbId.asset), notionQueryDb<NotionProject>(notion, notionDbId.project)])

    const projectMap = new Map(notionProjects.map((p) => [p.properties.Index.number, p.id]))

    for (const asset of notionAssets) {
      const projectIndex = asset.properties['Project Index'].number // asset.properties['Project Index'].rollup?.array?.[0]?.number

      console.log({ projectIndex })
      if (projectIndex !== 0) continue

      const projectId = projectMap.get(projectIndex)

      if (!projectId) {
        console.warn(`Project not found for index: ${projectIndex}`)
        continue
      }

      await notion.pages.update({
        page_id: asset.id,
        properties: {
          Project: {
            relation: [{ id: projectId }],
          },
        },
      })

      console.log(`Updated asset ${asset.properties.Slug.formula.string} → Project ${projectIndex}`)
    }

    return { result: { updated: notionAssets.length } }
  },
})
