export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const activeOrgId = getActiveOrgId(event, user)

    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { templateData } = await retransformTemplate(event, { ...body, orgId: activeOrgId, templateId: body.templateId })

    const response = await $fetch<{ contentHtml?: string; error?: string }>('/api/interaction/email/template/preview', {
      baseURL: config.public.connectUrl,
      headers: serviceHeaders('connect'),
      method: 'POST',
      body: {
        templateId: body.templateId,
        variables: templateData,
      },
    })

    if (response.error) {
      throw createError({ statusCode: 400, statusMessage: response.error })
    }

    return { contentHtml: response.contentHtml }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /connect/[channel]/template/preview POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
