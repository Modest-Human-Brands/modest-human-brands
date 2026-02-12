export default defineTask({
  meta: {
    name: 'sync:asset',
    description: 'Sync Asset',
  },
  async run() {
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const notionAssets = await notionQueryDb<NotionAsset>(notion, notionDbId.asset)

    console.log({ notionAssets })

    return { result: 'Success' }
  },
})
