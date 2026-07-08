import { z } from 'zod'
import type { NotionCompliance } from '~~/shared/types'

const paramSchema = z.object({ slug: z.string().min(1) })
const bodySchema = z.object({
  content: z.record(z.string(), z.unknown()),
})

export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)

    const { slug } = await getValidatedRouterParams(event, paramSchema.parse)
    const { content } = await readValidatedBody(event, bodySchema.parse)

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
      throw createError({ statusCode: 404, statusMessage: `Cannot update: slug '${slug}' not found.` })
    }

    const oldBlocks = await notion.blocks.children.list({
      block_id: targetRecord.id,
    })
    await Promise.all(oldBlocks.results.map((block) => notion.blocks.delete({ block_id: block.id })))

    const jsonString = JSON.stringify(content)
    const chunks = jsonString.match(/.{1,2000}/g) || []
    const newBlocks = chunks.map((chunk) => ({
      object: 'block' as const,
      type: 'paragraph' as const,
      paragraph: { rich_text: [{ type: 'text' as const, text: { content: chunk } }] },
    }))

    await notion.blocks.children.append({
      block_id: targetRecord.id,
      children: newBlocks,
    })

    await docStorage.setItem(slug, content)

    return { success: true, updatedAt: new Date().toISOString() }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API compliance/[slug] PUT', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
