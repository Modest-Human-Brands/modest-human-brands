import pThrottle from 'p-throttle'
import pRetry, { AbortError } from 'p-retry'

const throttle = pThrottle({
  limit: 3,
  interval: 1000,
})

const throttledNotion = throttle((task: () => Promise) =>
  pRetry(task, {
    retries: 3,
    onFailedAttempt: (error) => {
      const isRateLimited = error?.status === 429 || error?.code === 'rate_limited'
      if (!isRateLimited) throw new AbortError(error)
    },
  })
) as (task: () => Promise) => Promise

export default defineTask({
  meta: {
    name: 'sync:resource',
    description: 'Sync Notion Resources into cache',
  },
  async run() {
    const startTime = Date.now()
    console.info('[sync:resource] Starting resource synchronization...')

    const config = useRuntimeConfig()
    const rawDbId = config.private.notionDbId
    const notionDbId: NotionDB = typeof rawDbId === 'string' ? JSON.parse(rawDbId) : (rawDbId as unknown as NotionDB)

    const dbEntries = [
      { type: 'organization', fn: () => notionQueryDb<NotionOrganization>(notion, notionDbId.organization) },
      { type: 'user', fn: () => notionQueryDb<NotionUser>(notion, notionDbId.user) },
      { type: 'contact', fn: () => notionQueryDb<NotionContact>(notion, notionDbId.contact) },
      { type: 'project', fn: () => notionQueryDb<NotionProject>(notion, notionDbId.project) },
      { type: 'deliverable', fn: () => notionQueryDb<NotionDeliverable>(notion, notionDbId.deliverable) },
      { type: 'compliance', fn: () => notionQueryDb<NotionCompliance>(notion, notionDbId.compliance) },
      { type: 'document', fn: () => notionQueryDb<NotionDocument>(notion, notionDbId.document) },
      { type: 'stream', fn: () => notionQueryDb<NotionStream>(notion, notionDbId.stream) },
      { type: 'media', fn: () => notionQueryDb<NotionMedia>(notion, notionDbId.media) },
    ] as const

    const results = await Promise.allSettled(dbEntries.map(({ fn }) => throttledNotion(fn)))

    for (const [idx, res] of results.entries()) {
      const { type } = dbEntries[idx]
      const resourceStorage = useStorage(`data:resource:${type}`)

      if (res.status === 'fulfilled') {
        const records = res.value.filter(Boolean)

        await Promise.allSettled(
          records.map(async (record) => {
            if (typeof record === 'string' || !record?.id) return

            const normalizedId = notionNormalizeId(record.id)
            const resource = (await resourceStorage.getItem(normalizedId)) ?? {
              type,
              notificationStatus: false,
              record,
            }

            resource.record = record
            await resourceStorage.setItem(normalizedId, resource)
          })
        )
      } else {
        console.warn(`Notion fetch failed for ${type}:`, res.reason)
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.info(`[sync:resource] Completed synchronization in ${duration}s`)
    return { result: 'success', duration: `${duration}s` }
  },
})
