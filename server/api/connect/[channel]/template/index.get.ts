import type { MConnectTemplate } from './[id].get'

export default defineEventHandler(async (event) => {
  try {
    const channel = getRouterParam(event, 'channel')
    const config = useRuntimeConfig()

    const response = await $fetch<MConnectTemplate[]>(`/api/interaction/${channel}/template`, {
      baseURL: config.public.connectUrl,
    })

    return response
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API connect/text/[channel]/template GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
