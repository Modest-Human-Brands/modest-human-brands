type ResourceQueries = {
  [K in ResourceType]: ResourceRecordMap[K][]
}

export default defineTask({
  meta: {
    name: 'sync:resource',
    description: 'Sync Notion Resources into cache',
  },
  async run() {
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB
    const resources: Pick<ResourceQueries, 'client' | 'project' | 'asset'> = {
      client: (await notionQueryDb<NotionProjectClient>(notion, notionDbId.client)).filter((a) => !!a),
      project: (await notionQueryDb<NotionProject>(notion, notionDbId.project)).filter((a) => !!a),
      asset: (await notionQueryDb<NotionAsset>(notion, notionDbId.asset)).filter((a) => !!a),
    }
    const results = await Promise.allSettled(Object.values(resources))

    for (const [idx, res] of results.entries()) {
      const type = Object.keys(resources)[idx] as keyof typeof resources
      const resourceStorage = useStorage<Resource>(`data:resource:${type}`)

      if (res.status === 'fulfilled')
        await Promise.allSettled(
          res.value.map(async (record) => {
            if (typeof record === 'string') return

            const resource = (await resourceStorage.getItem(notionNormalizeId(record.id))) ?? {
              type,
              notificationStatus: false,
              record,
            }

            resource.record = record
            resourceStorage.setItem(notionNormalizeId(record.id), resource)
          })
        )
      else console.warn(`Notion fetch failed for ${type}:`, res.reason)
    }

    return { result: 'success' }
  },
})
