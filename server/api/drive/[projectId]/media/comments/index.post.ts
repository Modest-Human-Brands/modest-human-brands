export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    return await $fetch('/api/media/comments', {
      method: 'POST',
      baseURL: config.public.driveUrl,
      body,
    })
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'Unknown Error' })
  }
})
