import type { MDocTemplateResponse } from './[id].get'
import { cleanTemplateVariables } from './[id].get'

export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()

    const response = await $fetch<MDocTemplateResponse[]>('/api/document/template', {
      baseURL: config.public.docUrl,
    })

    const cleanedTemplates = response.map(cleanTemplateVariables)

    return cleanedTemplates
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /doc/template GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
