import { z } from 'zod'
import type { NotionCompliance } from '~~/shared/types'

const paramSchema = z.object({ slug: z.string().min(1) })

export interface ComplianceDocMeta {
  id: string
  slug: string
  title: string
  updatedAt?: string
}

export default defineEventHandler(async (event) => {
  try {
    // await requireUserSession(event)

    const { slug } = await getValidatedRouterParams(event, paramSchema.parse)

    const metaStorage = useStorage<Resource<'compliance'>>('data:resource:compliance')
    const docStorage = useStorage<Record<string, unknown>>('data:resource:compliance:content')

    const keys = await metaStorage.getKeys()
    let targetRecord: NotionCompliance | null = null

    for (const key of keys) {
      const item = await metaStorage.getItem(key)
      if (item?.record?.properties?.Slug?.formula.string === slug) {
        targetRecord = item.record
        break
      }
    }

    if (!targetRecord) {
      throw createError({ statusCode: 404, statusMessage: `Compliance policy '${slug}' does not exist.` })
    }

    const docMeta: ComplianceDocMeta = {
      id: targetRecord.id,
      slug,
      title: targetRecord.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      updatedAt: targetRecord.last_edited_time,
    }

    let content = await docStorage.getItem(slug)

    if (!content) {
      const blocks = await notion.blocks.children.list({
        block_id: targetRecord.id,
      })

      const rawJsonString = blocks.results.map((b) => ('paragraph' in b ? b.paragraph?.rich_text?.[0]?.plain_text || '' : '')).join('')

      if (rawJsonString) {
        content = JSON.parse(rawJsonString)
        await docStorage.setItem(slug, content as Record<string, unknown>)
      }
    }

    const markdown = content ? tiptapToMarkdown(content) : null

    return {
      ...docMeta,
      content: content ?? null,
      markdown,
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API compliance/[slug] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
