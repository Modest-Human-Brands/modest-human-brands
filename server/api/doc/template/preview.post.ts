import { retransformTemplate } from '~~/server/utils/mdoc-transform'

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const orgId = user.organizations[0]

    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { mdocData } = await retransformTemplate({ ...body, orgId })

    const response = await $fetch<{ pdfBase64?: string; error?: string }>('/api/document/template/preview', {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: {
        templateId: body.templateId,
        variables: mdocData,
      },
    })

    if (response.error) {
      throw createError({ statusCode: 400, statusMessage: response.error })
    }

    return { pdfBase64: response.pdfBase64 }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /doc/template/preview POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
