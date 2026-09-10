interface EmailTelemetry {
  emailId: string
  aggregated: {
    totalOpens: number
    totalClicks: number
    botFiltered: number
    isHoneypotTriggered: boolean
    deviceBreakdown: {
      desktop: number
      mobile: number
      unknown: number
    }
    topUrls: Record<string, number>
    locations: string[]
    firstActivity: string | null
    lastActivity: string | null
  }
  timeline: {
    id: string
    type: string
    category: string
    title: string
    description: string
    timestamp: string
    targetUrl?: string
    deviceType?: string
    location?: string | null
    ip?: string
    userAgent?: string
    isValid?: boolean
    isBot?: boolean
  }[]
}

export default defineEventHandler(async (event) => {
  try {
    const channel = getRouterParam(event, 'channel')
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message ID is required',
      })
    }

    const { user } = await requireUserSession(event)
    const cookieOrgId = getCookie(event, 'active-org-id')
    const activeOrgId = user.organizations?.find((org) => org.orgId === cookieOrgId)?.orgId ?? user.organizations?.[0]?.orgId

    const config = useRuntimeConfig()

    const [data, telemetry] = await Promise.all([
      $fetch<{
        id: string
        senderName: string
        senderEmail: string
        isVerified?: boolean
        subject: string
        preview: string
        date: string
        contentHtml: string
      }>(`/api/interaction/${channel}/${id}`, {
        baseURL: config.public.connectUrl,
        headers: {
          ...(activeOrgId ? { 'x-org-id': activeOrgId } : {}),
        },
      }),
      channel === 'email'
        ? $fetch<EmailTelemetry>(`/api/interaction/email/${id}/telemetry`, {
            baseURL: config.public.connectUrl,
            headers: {
              ...(activeOrgId ? { 'x-org-id': activeOrgId } : {}),
            },
          }).catch(() => null)
        : Promise.resolve(null),
    ])

    const hasClicks = (telemetry?.aggregated?.totalClicks ?? 0) > 0
    const hasOpens = (telemetry?.aggregated?.totalOpens ?? 0) > 0

    const status = hasClicks ? 'Clicked' : hasOpens ? 'Opened' : 'Sent'
    const recipientStatus = hasClicks ? 'Clicked' : hasOpens ? 'Opened' : 'Delivered'

    const lastActivity = telemetry?.aggregated?.lastActivity || data.date
    const recipientStatusTime = new Date(lastActivity).toISOString()

    const recipientName = data.senderName

    const initialSentEvent = {
      id: `${data.id}:sent`,
      type: 'sent',
      title: 'Email Sent',
      description: `Sent to ${recipientName}`,
      timestamp: new Date(data.date).toISOString(),
    }

    const telemetryEvents = (telemetry?.timeline || [])
      .filter((t) => !t.isBot)
      .map((t) => ({
        id: t.id,
        type: t.type,
        title: t.title || (t.type === 'click' ? 'Link Clicked' : 'Mail Opened'),
        description: t.type === 'click' && t.targetUrl ? `Clicked: ${t.targetUrl}` : t.description,
        timestamp: new Date(t.timestamp).toISOString(),
      }))

    return {
      ...data,
      date: new Date(data.date).toISOString(),
      status,
      description: data.preview?.split('\n')[0] || data.subject,
      recipientName,
      recipientEmail: data.senderEmail,
      recipientStatus,
      recipientStatusTime,
      attachments: [],
      timeline: [initialSentEvent, ...telemetryEvents],
      telemetry: telemetry?.aggregated ?? null,
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error(`API connect/[channel]/[id] GET`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch message details',
    })
  }
})
