export interface MConnectTimelineResponse {
  client_id: string
  results: {
    interactionId: string
    channel: ChannelType
    direction: string
    timestamp: string
    content: string
    status: 'sending' | 'sent' | 'error'
    metadata: {
      recordingUrl?: string
      subject?: string
      hasAttachments?: boolean
    }
  }[]
  pagination: {
    total: number
    limit: number
    skip: number
  }
}

export default defineEventHandler(async (event) => {
  // const { user } =
  await requireUserSession(event)

  const clientId = getRouterParam(event, 'id')

  const config = useRuntimeConfig()

  if (!clientId || clientId === 'undefined') {
    throw createError({ statusCode: 400, statusMessage: 'Missing client ID' })
  }

  try {
    const rawTimeline = await $fetch<MConnectTimelineResponse>(`/api/contacts/${clientId}/timeline`, {
      baseURL: config.public.connectUrl,
    })

    return rawTimeline.results.map((item) => ({
      id: item.interactionId,
      content: item.content,
      time: item.timestamp,
      isOwn: item.direction === 'outbound',
      channel: item.channel,
      status: item.status || 'sent',
      metadata: {
        subject: item.metadata?.subject,
        recordingUrl: item.metadata?.recordingUrl,
        hasAttachments: item.metadata?.hasAttachments,
      },
    }))
  } catch (error) {
    console.error(`API connect/[id]/timeline GET`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch timeline from MConnect',
    })
  }
})
