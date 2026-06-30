interface MDriveComment {
  commentId: string
  parentId: string | null
  text: string
  coordinates: {
    x: number
    y: number
  }
  author: {
    name: string
    role: string
  }
  createdAt: string
  replies: MDriveComment[]
}

interface MDriveTimeline {
  timelines: Record<string, MDriveComment[]>
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    return await $fetch<MDriveTimeline>('/api/media/comments/query', {
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
