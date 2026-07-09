export default defineEventHandler(async (event) => {
  try {
    const docId = getRouterParam(event, 'docId')
    const config = useRuntimeConfig()

    const body = await readBody(event)

    const clientIp = getRequestIP(event, { xForwardedFor: true })
    body.telemetry = {
      ...(body.telemetry || {}),
      ipAddress: clientIp,
    }

    const response = await $fetch(`/api/document/${docId}/sign/server`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body,
    })

    return response
  } catch (error: unknown) {
    console.error(`API /doc/[projectId]/[docId]/server POST`, error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
