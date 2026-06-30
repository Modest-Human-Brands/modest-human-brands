export interface MDriveProjectSummaryResponse {
  id: string
  orgId: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
  config: {
    watermarkEnabled: boolean
  }
  mediaSummary: {
    totals: {
      count: number
      storageBytes: number
      humanReadableStorage: string
    }
    breakdown: {
      photo: {
        count: number
        storageBytes: number
        humanReadableStorage: string
        approval: {
          total: number
          approved: number
          notApproved: number
          pending: number
        }
      }
      video: {
        count: number
        storageBytes: number
        humanReadableStorage: string
        approval: {
          total: number
          approved: number
          notApproved: number
          pending: number
        }
      }
      audio: {
        count: number
        storageBytes: number
        humanReadableStorage: string
        approval: {
          total: number
          approved: number
          notApproved: number
          pending: number
        }
      }
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)

    const projectId = notionNormalizeId(getRouterParam(event, 'projectId')!)

    if (!projectId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing target projectId parameter' })
    }

    const config = useRuntimeConfig()

    const response = await $fetch<MDriveProjectSummaryResponse>(`/api/projects/${projectId}`, {
      baseURL: config.public.driveUrl,
    })

    return response
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /drive/[projectId] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
