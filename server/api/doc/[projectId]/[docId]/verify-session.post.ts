export default defineEventHandler(async (event) => {
  const docId = getRouterParam(event, 'docId')

  console.log({ docId })

  if (!docId) {
    throw createError({ statusCode: 400, statusMessage: 'Document ID is strictly required' })
  }

  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<{
      isValid: boolean
      signerEmail: string
      role: string
      order: number
      status: string
    }>(`/api/document/${docId}/verify-session`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: {
        sessionToken: body?.sessionToken,
      },
    })

    return response
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error(`API /doc/[projectId]/[docId]/verify POST`, error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
