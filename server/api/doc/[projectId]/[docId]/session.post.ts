export default defineEventHandler(async (event) => {
  const docId = getRouterParam(event, 'docId')
  const body = await readBody(event)
  const config = useRuntimeConfig()

  console.log({ docId })

  try {
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

    console.log({ response })

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
