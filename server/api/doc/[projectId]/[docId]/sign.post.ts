interface SignerDetails {
  order: number
  name: string
  email: string
  role: string
  status: string
  signedAt: string
  telemetry?: {
    ipAddress?: string
    userAgent?: string
  }
}

export default defineEventHandler(async (event) => {
  const docId = getRouterParam(event, 'docId')
  if (!docId) {
    throw createError({ statusCode: 400, statusMessage: 'Document/Envelope ID is strictly required' })
  }

  const orgId = ((await notion.pages.retrieve({ page_id: docId })) as unknown as NotionDocument).properties.Organization.relation[0]?.id

  const body = await readBody(event)
  const { sessionToken, fields, telemetry } = body

  if (!sessionToken || !fields) {
    throw createError({ statusCode: 400, statusMessage: 'Malformed signature execution payload' })
  }

  const config = useRuntimeConfig()

  const clientIp = getRequestIP(event, { xForwardedFor: true })
  const enrichedTelemetry = {
    ...(telemetry || {}),
    ipAddress: clientIp,
  }

  try {
    const response = await $fetch<{ id: string; documentStatus: 'Completed' | 'Partially Signed'; currentSigner: SignerDetails | null; nextSigner: SignerDetails | null }>(
      `/api/document/${docId}/sign`,
      {
        baseURL: config.public.docUrl,
        method: 'POST',
        body: {
          sessionToken,
          fields,
          telemetry: enrichedTelemetry,
        },
      }
    )
    const isCompleted = response.documentStatus === 'Completed'

    notify(
      event,
      'DOCUMENT_SIGNED',
      {
        documentId: response.id,
        signerName: response.currentSigner?.name,
        status: response.documentStatus,
      },
      orgId
    )

    if (isCompleted) {
      notify(event, 'DOCUMENT_COMPLETED', { documentId: response.id })
    }

    return response
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error(`API /doc/[projectId]/[docId]/sign POST`, error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
