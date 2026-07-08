export interface MDocTemplateResponse {
  id: string
  label: string
  description: string
  variables: Record<string, string>
  signerFields: {
    id: string
    type: string
    signerOrder: number
    pageIndex: string
    x: number
    y: number
    width: number
    height: number
    required: boolean
    fontSize?: string
  }[]
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const id = getRouterParam(event, 'id')

    const response = await $fetch<MDocTemplateResponse>(`/api/document/template/${id}`, {
      baseURL: config.public.docUrl,
    })

    const transformedTemplate = { ...response, variables: await transformTemplate(response.variables) }

    return transformedTemplate
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /doc/template/[id] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
