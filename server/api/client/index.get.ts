export default defineEventHandler<Promise<ClientItem[]>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const cookieOrgId = getCookie(event, 'active-org-id')
    const activeOrgId = user.organizations?.find((org) => org.orgId === cookieOrgId)?.orgId ?? user.organizations?.[0]?.orgId

    if (!activeOrgId) return []

    const storage = useStorage<Resource<'contact'>>('data:resource:contact')
    const keys = await storage.getKeys()
    const records = await Promise.all(keys.map((k) => storage.getItem(k)))

    const clients: ClientItem[] = records
      .map((r) => r?.record)
      .filter((record): record is NotionContact => {
        if (!record || !record.properties) return false
        return Boolean(record.properties.Organization?.relation?.some((r) => r.id === activeOrgId))
      })
      .map((record) => {
        const props = record.properties

        const name = props.Name?.title?.[0]?.plain_text || 'Unknown'
        const company = props.Company?.rich_text?.[0]?.plain_text || 'Unknown'
        const pocName = props['PoC Person']?.rich_text?.[0]?.plain_text || 'Unknown'

        return {
          id: record.id,
          name,
          company,
          email: props.Email?.email || '',
          phone: props.Phone?.phone_number || props.Whatsapp?.phone_number || '',
          status: props.Status?.select?.name || 'Active',
          type: props.Type?.select?.name || 'Client',
          tags: props.Tags?.multi_select?.map((tag) => tag.name) || [],
          pocName,
          pocEmail: props['PoC Email']?.email || '',
          lastActive: new Date(props['Last Active']?.date?.start || record.last_edited_time).toISOString(),
          lastMessageSnippet: props['Last Message Snippet']?.rich_text?.[0]?.plain_text || '',
        }
      })
      .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())

    return clients
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API client GET', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch clients',
    })
  }
})
