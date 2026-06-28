import type { ComplianceDocMeta } from './[slug].get'

export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)

    const storage = useStorage<ComplianceDocMeta[]>('data:compliance')
    const meta = await storage.getItem('meta')

    return meta
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
