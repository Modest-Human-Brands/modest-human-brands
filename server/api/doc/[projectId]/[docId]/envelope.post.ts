export default defineEventHandler(async (event) => {
  try {
    const docId = getRouterParam(event, 'docId')
    const body = await readBody<{ expiresInDays: number; routingType: string; signers: { order: number; name: string; email: string; role: string; status: string }[] }>(event)
    const config = useRuntimeConfig()

    const envelopeRes = await $fetch<{ status: string; nextSigner: string; queueSize: number }>(`/api/document/${docId}/envelope`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body,
    })

    return envelopeRes
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error(`API doc/[projectId]/[docId/envelope] POST`, error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
