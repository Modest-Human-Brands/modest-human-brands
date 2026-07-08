import { retransformTemplate } from '~~/server/utils/mdoc-transform'

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const orgId = user.organizations[0]

    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { organization, mdocData } = await retransformTemplate({ ...body, orgId, templateId: body.templateId })

    const documentStorage = useStorage<Resource<'document'>>('data:resource:document')
    const documents = (await documentStorage.getItems(await documentStorage.getKeys()))
      .flatMap(({ value }) => value?.record || [])
      .filter((record) => record.properties.Organization.relation[0]?.id === orgId)

    body.name = `${organization.name.replaceAll(' ', '-').toLowerCase()}-${body.template.toUpperCase()[0]}-${documents.length}-1`
    body.orgId = orgId
    body.data = mdocData

    const response = await $fetch<{ id: string; templateId: string; name: string; sizeBytes: number }>('/api/document/template', {
      baseURL: config.public.docUrl,
      method: 'POST',
      body,
    })

    notify(
      event,
      'DOCUMENT_CREATED',
      {
        documentId: response.id,
        templateId: response.templateId,
        fileName: response.name,
      },
      orgId
    )

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
