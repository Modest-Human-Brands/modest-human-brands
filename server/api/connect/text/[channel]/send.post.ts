export default defineEventHandler(async (event) => {
  const channel = getRouterParam(event, 'channel')
  const body = await readBody(event)
  const { user } = await requireUserSession(event)

  const config = useRuntimeConfig()

  if (body.variables) body.variables.organization = await $fetch(`/api/organization/${user.organizations[0]}`)

  try {
    const response = await $fetch<{
      success: boolean
      interactionId?: string
      dispatchId?: string
    }>(`/api/connect/text/${channel}/send`, {
      baseURL: config.public.connectUrl,
      method: 'POST',
      body: {
        contactId: body.contactId,
        userId: user.id,
        orgId: user.organizations[0],
        template: body.template ?? 'none',
        subject: body.subject,
        text: body.text,
        variables: body.variables ?? {},
      },
    })

    return response
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API connect/text/[channel]/send POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
