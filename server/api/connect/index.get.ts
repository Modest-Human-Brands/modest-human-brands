export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const cookieOrgId = getCookie(event, 'active-org-id')
    const activeOrgId = user.organizations?.find((org) => org.orgId === cookieOrgId)?.orgId ?? user.organizations?.[0]?.orgId

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
      headers: {
        ...(activeOrgId ? { 'x-org-id': activeOrgId } : {}),
      },
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
