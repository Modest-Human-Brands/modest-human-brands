import { z } from 'zod'
import type { ComplianceDocMeta } from './[slug].get'

const bodySchema = z.object({
  title: z.string().min(2, 'Title must contain at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
})

export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)

    const { title, slug } = await readValidatedBody(event, bodySchema.parse)

    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const storage = useStorage<Resource<'compliance'>>('data:resource:compliance')
    const keys = await storage.getKeys()

    for (const key of keys) {
      const item = await storage.getItem(key)
      if (item?.record?.properties?.Slug?.formula.string === slug) {
        throw createError({ statusCode: 409, statusMessage: `Conflict: Slug '${slug}' already exists.` })
      }
    }

    const notionResponse = await notion.pages.create({
      parent: { data_source_id: notionDbId.compliance },
      properties: {
        Name: { title: [{ text: { content: title } }] },
        //       Slug: { rich_text: [{ text: { content: slug } }] },
      },
    })

    const newMeta: ComplianceDocMeta = {
      id: notionResponse.id,
      slug,
      title,
      updatedAt: new Date().toISOString(),
    }

    await storage.setItem(notionNormalizeId(notionResponse.id)!, { type: 'compliance', notificationStatus: false, record: notionResponse })

    return { success: true, doc: newMeta }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API compliance POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
