export default defineEventHandler(async (event) => {
  const channel = getRouterParam(event, 'channel')
  const { contactId, subject, text } = await readBody(event)

  const config = useRuntimeConfig()

  if (!contactId || !text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing contactId or message body' })
  }

  try {
    const response = await $fetch<{
      success: boolean
      interactionId?: string
      dispatchId?: string
    }>(`/api/connect/text/${channel}/send`, {
      baseURL: config.public.connectUrl,
      method: 'POST',
      body: {
        contactId,
        template: 'none',
        subject,
        text,
      },
    })

    return response
  } catch (error) {
    console.error(`MConnect Outbound Dispatch Error [${channel}]:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to dispatch ${channel} payload to MConnect`,
    })
  }
})
