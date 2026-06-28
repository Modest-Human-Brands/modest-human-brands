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

    const metaStorage = useStorage<ComplianceDocMeta[]>('data:compliance')
    const metaList = (await metaStorage.getItem('meta')) ?? []

    if (metaList.some((m) => m.slug === slug)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Conflict: A compliance document with slug '${slug}' already exists.`,
      })
    }

    const now = new Date().toISOString()
    const newMeta: ComplianceDocMeta = {
      id: slug,
      slug,
      title,
      updatedAt: now,
    }

    metaList.push(newMeta)
    await metaStorage.setItem('meta', metaList)

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
