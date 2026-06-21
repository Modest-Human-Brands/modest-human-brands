export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const config = useRuntimeConfig()
    const body = await readBody(event)

    const orgId = user.organizations[0]
    const organization = await $fetch(`/api/organization/${orgId}`)

    const documentStorage = useStorage<Resource<'document'>>(`data:resource:document`)
    const documents = (await documentStorage.getItems(await documentStorage.getKeys()))
      .flatMap(({ value }) => value?.record || [])
      .filter((record) => record.properties.Organization.relation[0]?.id === orgId)

    body.name = `${organization.name.replaceAll(' ', '-').toLowerCase()}-${body.template.toUpperCase()[0]}-${documents.length}-1`
    body.orgId = orgId

    if (!body.data) body.data = {}
    body.data.organization = organization
    body.data.accountDetails = {
      accountName: 'RED CAT PICTURES',
      accountNumber: 1234567890,
      bankName: 'AXIS Bank',
      ifscCode: 'AXS00001234',
    }

    const response = await $fetch<{
      id: string
      variables: Record<string, string>
    }>('/api/document/create', {
      baseURL: config.public.docUrl,
      method: 'POST',
      body,
    })

    return response
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /doc/template POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
