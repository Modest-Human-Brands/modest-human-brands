import { z } from 'zod'

const paramSchema = z.object({ slug: z.string().min(1) })

export interface ComplianceDocMeta {
  id: string
  slug: string
  title: string
  updatedAt?: string
}

export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)

    const { slug } = await getValidatedRouterParams(event, paramSchema.parse)

    const metaStorage = useStorage<ComplianceDocMeta[]>('data:compliance')
    const docStorage = useStorage<Record<string, unknown>>('data:compliance:content')

    const metaList = (await metaStorage.getItem('meta')) ?? []

    const docMeta = metaList.find((m) => m.slug === slug)
    if (!docMeta) {
      throw createError({
        statusCode: 404,
        statusMessage: `Compliance policy '${slug}' does not exist in operating ledger.`,
      })
    }

    const content = await docStorage.getItem(slug)

    return {
      ...docMeta,
      content: content ?? null,
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
