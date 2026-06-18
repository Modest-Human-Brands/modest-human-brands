export interface MConnectContactResponse {
  pagination: {
    total: number
    limit: number
    offset: number
  }
  results: {
    id: string
    name: string
    company: string
    jobTitle: string
    email: string | null
    phone: string | null
    instagram: string | null
    status: string
    lastActive: string
    lastMessageSnippet: string
    platforms: string[]
  }[]
}

export default defineEventHandler(async (event) => {
  try {
    // const { user } =
    await requireUserSession(event)

    const config = useRuntimeConfig()

    const rawData = await $fetch<MConnectContactResponse>('/api/contacts', {
      baseURL: config.public.connectUrl,
    })

    return rawData.results.map((contact) => {
      return {
        id: contact.id,
        name: contact.name || 'Unknown',
        initial: contact.name ? contact.name.charAt(0).toUpperCase() : 'U',
        company: contact.company,
        lastActive: contact.lastActive,
        lastMessageSnippet: contact.lastMessageSnippet,
        activeChannel: (contact.platforms[0] || 'email') as ChannelType,
        availableChannels: contact.platforms as ChannelType[],
      }
    })
  } catch (error) {
    console.error('API GET connect/index:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contacts from MConnect',
    })
  }
})
