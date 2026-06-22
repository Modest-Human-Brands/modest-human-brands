export default defineEventHandler(async (event) => {
  try {
    const docId = getRouterParam(event, 'docId')
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const response = await $fetch<{
      signer: string
      expiresAt: string
      token: string
      magicLink: string
    }>(`/api/document/${docId}/session`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: body || {},
    })

    return response
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error(`API /doc/[projectId]/[docId]/session POST`, error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
