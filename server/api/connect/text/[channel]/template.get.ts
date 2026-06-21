export default defineEventHandler(async (event) => {
  try {
    // const { user } =
    await requireUserSession(event)

    const channel = getRouterParam(event, 'channel')
    const config = useRuntimeConfig()

    const data = await $fetch<{ id: string; variables: Record<string, string> }>(`/api/connect/text/${channel}/template`, {
      baseURL: config.public.connectUrl,
    })

    return data
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
