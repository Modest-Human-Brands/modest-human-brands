import { transformTemplate } from '~~/server/utils/mdoc-transform'

export interface MDocTemplateResponse {
  id: string
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

    const response = await $fetch<MDocTemplateResponse[]>('/api/document/template', {
      baseURL: config.public.docUrl,
    })

    const rawTemplate = response.find((t) => t.id === id)
    if (!rawTemplate) throw createError({ statusCode: 404, statusMessage: 'Template not found' })

    const transformedTemplate = { ...rawTemplate, variables: await transformTemplate(rawTemplate.variables) }

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
