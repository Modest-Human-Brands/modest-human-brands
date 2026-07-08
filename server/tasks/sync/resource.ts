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

    const resources: ResourceQueries = {
      organization: (await notionQueryDb<NotionOrganization>(notion, notionDbId.organization)).filter((a) => !!a),
      user: (await notionQueryDb<NotionUser>(notion, notionDbId.user)).filter((a) => !!a),
      contact: (await notionQueryDb<NotionContact>(notion, notionDbId.contact)).filter((a) => !!a),
      project: (await notionQueryDb<NotionProject>(notion, notionDbId.project)).filter((a) => !!a),
      deliverable: (await notionQueryDb<NotionDeliverable>(notion, notionDbId.deliverable)).filter((a) => !!a),
      compliance: (await notionQueryDb<NotionCompliance>(notion, notionDbId.compliance)).filter((a) => !!a),
      document: (await notionQueryDb<NotionDocument>(notion, notionDbId.document)).filter((a) => !!a),
      stream: (await notionQueryDb<NotionStream>(notion, notionDbId.stream)).filter((a) => !!a),
      media: (await notionQueryDb<NotionMedia>(notion, notionDbId.media)).filter((a) => !!a),
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
