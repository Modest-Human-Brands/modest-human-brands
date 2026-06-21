export function cleanTemplateVariables(template: { id: string; variables: object }) {
  const vs = ['organization', 'accountDetails']
  for (const v of vs) {
    if (template.variables[v]) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete template.variables[v]
    }
  }

  return template
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const id = getRouterParam(event, 'id')

    const response = await $fetch<{ id: string; variables: Record<string, string> }[]>('/api/document/template', {
      baseURL: config.public.docUrl,
    })

    const template = response.map(cleanTemplateVariables).filter((t) => t.id === id)[0]

    return template
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
