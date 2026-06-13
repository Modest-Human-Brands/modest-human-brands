export interface MConnectTimelineResponse {
  client_id: string
  results: {
    interactionId: string
    channel: string
    direction: string
    timestamp: string
    summary: string
    status: string
    metadata: {
      recordingUrl?: string
    }
  }[]
  pagination: {
    total: number
    limit: number
    skip: number
  }
}

export default defineEventHandler(async (event) => {
  const clientId = getRouterParam(event, 'id')

  if (!clientId || clientId === 'undefined') {
    throw createError({ statusCode: 400, statusMessage: 'Missing client ID' })
  }

  try {
    const rawTimeline = await $fetch<MConnectTimelineResponse>(`/api/contacts/${clientId}/timeline`, {
      baseURL: 'http://localhost:3001',
    })

    return {
      clientId,
      interactions: rawTimeline.results.map((item) => ({
        id: item.interactionId,
        channel: item.channel,
        direction: item.direction,
        timestamp: item.timestamp,
        summary: item.summary,
        status: item.status,
        metadata: {
          recordingUrl: item.metadata?.recordingUrl,
        },
      })),
    }
  } catch (error) {
    console.error(`Timeline Proxy Error for ${clientId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch timeline from MConnect',
    })
  }
})
