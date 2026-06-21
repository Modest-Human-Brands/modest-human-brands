export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Document/Envelope ID is strictly required' })
  }

  const body = await readBody(event)
  const { sessionToken, fields, telemetry } = body

  if (!sessionToken || !fields) {
    throw createError({ statusCode: 400, statusMessage: 'Malformed signature execution payload' })
  }

  const config = useRuntimeConfig()

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const enrichedTelemetry = {
    ...(telemetry || {}),
    ipAddress: clientIp,
  }

  try {
    const response = await $fetch(`/api/document/${id}/sign`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: {
        sessionToken,
        fields,
        telemetry: enrichedTelemetry,
      },
    })

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
