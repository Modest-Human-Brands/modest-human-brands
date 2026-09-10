export default defineEventHandler(async (event) => {
  try {
    const channel = getRouterParam(event, 'channel')
    const body = await readBody(event)

    const { user } = await requireUserSession(event)
    const cookieOrgId = getCookie(event, 'active-org-id')
    const activeOrgId = user.organizations?.find((org) => org.orgId === cookieOrgId)?.orgId ?? user.organizations?.[0]?.orgId

    const config = useRuntimeConfig()

    const { recipientId, organization, templateData } = await retransformTemplate({
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
      headers: {
        ...(activeOrgId ? { 'x-org-id': activeOrgId } : {}),
      },
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
