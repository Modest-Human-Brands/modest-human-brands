import { z } from 'zod'
import type { ComplianceDocMeta } from './[slug].get'

const paramSchema = z.object({ slug: z.string().min(1) })
const bodySchema = z.object({
  content: z.record(z.string(), z.unknown()),
})

export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)

    const { slug } = await getValidatedRouterParams(event, paramSchema.parse)
    const { content } = await readValidatedBody(event, bodySchema.parse)

    const metaStorage = useStorage<ComplianceDocMeta[]>('data:compliance')
    const docStorage = useStorage<Record<string, unknown>>('data:compliance:content')

    const metaList = (await metaStorage.getItem('meta')) ?? []
    const docIndex = metaList.findIndex((m) => m.slug === slug)

    if (docIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: `Cannot update: Compliance slug '${slug}' not found.`,
      })
    }

    const now = new Date().toISOString()

    metaList[docIndex] = {
      ...metaList[docIndex]!,
      updatedAt: now,
    }

    await Promise.all([docStorage.setItem(slug, content), metaStorage.setItem('meta', metaList)])

    return { success: true, updatedAt: now }
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
