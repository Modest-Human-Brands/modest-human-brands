export interface VoidDocumentResponse {
  documentStatus: string
  fileName: string
}

export default defineEventHandler(async (event) => {
  // const { user } =
  // await requireUserSession(event)

  const docId = getRouterParam(event, 'docId')

  if (!docId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing document ID' })
  }

  const body = await readBody<{ reason?: string }>(event)
  const reason = body?.reason?.trim()

  if (!reason || reason.length < 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A reason (at least 5 characters) must be provided to void the document.',
    })
  }

  const config = useRuntimeConfig()

  try {
    const result = await $fetch<VoidDocumentResponse>(`/api/document/${docId}/void`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: { reason },
    })

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    // Forward upstream HTTP status & message (e.g. 403 Already Voided/Completed, 404 Missing file)

    console.error(`API doc/[projectId]/[docId]/void POST`, error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
