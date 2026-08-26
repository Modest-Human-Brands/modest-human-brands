export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)

    const config = useRuntimeConfig()

    const rawData = await $fetch<
      {
        id: string
        senderName: string
        senderEmail: string
        avatarUrl: string | undefined
        isVerified: boolean
        subject: string
        preview: string
        date: string
        contentHtml: string
      }[]
    >('/api/interaction', {
      baseURL: config.public.connectUrl,
    })

    return rawData.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API connect/index GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch messages',
    })
  }
})
