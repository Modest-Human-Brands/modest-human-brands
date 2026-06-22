export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const orgId = user.organizations[0]
    const organization = await $fetch(`/api/organization/${orgId}`)

    const organizationStorage = useStorage<Resource<'organization'>>('data:resource:organization')

    if (!body.data) body.data = {}
    body.data.organization = organization
    const organizationContent = await organizationStorage.get(orgId!)
    body.data.accountDetails = organizationContent?.record.properties['Account Details']

    const response = await $fetch<{ pdfBase64?: string; error?: string }>('/api/document/template/preview', {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: {
        templateId: body.templateId,
        variables: body.data,
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
