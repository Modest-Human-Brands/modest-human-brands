export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()

    const response = await $fetch<
      {
        id: string
        variables: Record<string, string>
      }[]
    >('/api/document/template', {
      baseURL: config.public.docUrl,
    })

    const cleanedTemplates = response.map((template) => {
      if (template.variables?.organization) {
        delete template.variables.organization
      }
      return template
    })

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
