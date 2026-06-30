export interface MdriveProjectMediaResponse {
  data: {
    id: string
    url?: string
    filename: string
    status: string
    type: string
    metadata?: {
      resolution?: string
      aspectRatio?: string
      [key: string]: string | boolean | undefined
    }
  }[]
  totalItems: number
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const projectId = notionNormalizeId(getRouterParam(event, 'projectId')!)

    if (!projectId || typeof projectId !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required target projectId parameter',
      })
    }

    const { projectId: _, ...forwardedQuery } = query
    const config = useRuntimeConfig()

    const response = await $fetch<MdriveProjectMediaResponse>(`/api/projects/${projectId}/media`, {
      baseURL: config.public.driveUrl,
      method: 'GET',
      query: {
        ...forwardedQuery,
      },
    })

    return response
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /drive/[projectId]/media GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
