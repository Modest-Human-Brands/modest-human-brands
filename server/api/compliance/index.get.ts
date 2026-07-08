import type { ComplianceDocMeta } from './[slug].get'

export default defineEventHandler(async (_event) => {
  try {
    // await requireUserSession(event)

    const storage = useStorage<Resource<'compliance'>>('data:resource:compliance')
    const keys = await storage.getKeys()
    const records = await Promise.all(keys.map((k) => storage.getItem(k)))

    const metaList: ComplianceDocMeta[] = records
      .map((r) => r?.record)
      .filter(Boolean)
      .map((record) => ({
        id: record!.id,
        slug: record!.properties.Slug?.formula.string,
        title: record!.properties.Name?.title?.[0]?.plain_text || 'Untitled',
        updatedAt: record!.last_edited_time,
      }))

    return metaList
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API compliance GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
