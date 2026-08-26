export interface MConnectTemplate {
  id: string
  label: string
  description: string
  variables: Record<string, string>
}
export default defineEventHandler(async (event) => {
  try {
    const channel = getRouterParam(event, 'channel')

    const config = useRuntimeConfig()
    const id = getRouterParam(event, 'id')

    const response = await $fetch<MConnectTemplate>(`/api/interaction/${channel}/template/${id}`, {
      baseURL: config.public.connectUrl,
    })

    const transformedTemplate = { ...response, variables: await transformTemplate(response.variables) }

    return transformedTemplate
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /connect/[channel]/template/[id] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
