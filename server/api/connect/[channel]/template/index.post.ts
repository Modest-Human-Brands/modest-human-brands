export default defineEventHandler(async (event) => {
  try {
    const channel = getRouterParam(event, 'channel')
    const body = await readBody(event)

    const { user } = await requireUserSession(event)
    const activeOrgId = getActiveOrgId(event, user)
    const activeOrgSlug = await getOrgSlug(activeOrgId)

    const config = useRuntimeConfig()

    const { recipientId, organization, templateData } = await retransformTemplate(event, {
      ...body,
      orgId: activeOrgId,
      templateId: body.template,
    })

    const response = await $fetch<{
      success: boolean
      interactionId?: string
      dispatchId?: string
    }>(`/api/interaction/${channel}/send`, {
      baseURL: config.public.connectUrl,
      headers: serviceHeaders('connect', { 'x-org-id': activeOrgSlug }),
      method: 'POST',
      body: {
        contactId: body?.contactId ?? recipientId,
        userId: user.id,
        template: body.template,
        subject: body?.subject,
        text: body?.text,
        variables: {
          ...(templateData ?? {}),
          organization,
        },
      },
    })

    return response
  } catch (error: unknown) {
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
