export default defineEventHandler(async (event) => {
  const channel = getRouterParam(event, 'channel')
  const { contactId, subject, text } = await readBody(event)

  if (!contactId || !text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing contactId or message body' })
  }

  try {
    const response = await $fetch<{
      success: boolean
      interactionId?: string
      dispatchId?: string
    }>(`/api/connect/text/${channel}/send`, {
      baseURL: 'http://localhost:3001',
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
