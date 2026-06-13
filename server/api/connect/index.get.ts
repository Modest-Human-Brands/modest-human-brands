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

export default defineEventHandler(async () => {
  try {
    const rawData = await $fetch<MConnectContactResponse>('/api/contacts', {
      baseURL: 'http://localhost:3001',
    })

    return rawData.results.map((contact) => {
      return {
        id: contact.id,
        name: contact.name,
        initial: contact.name ? contact.name.charAt(0).toUpperCase() : 'U',
        status: contact.status,
        platforms: contact.platforms,
        company: contact.company,
        jobTitle: contact.jobTitle,
        lastActive: contact.lastActive,
        lastMessageSnippet: contact.lastMessageSnippet,
      }
    })
  } catch (error) {
    console.error('MConnect Proxy Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contacts from MConnect',
    })
  }
})
