export default defineEventHandler<Promise<User[]>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const activeOrgId = getActiveOrgId(event, user)

    if (!activeOrgId) return []

    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const contacts = (
      await notionQueryDb<NotionContact>(notion, notionDbId.contact, {
        filter: {
          property: 'Organization',
          relation: {
            contains: activeOrgId,
          },
        },
      })
    ).filter((a) => !!a)

    return contacts.map((user) => ({
      id: user.id,
      name: notionTextStringify(user.properties.Name.title),
      email: user.properties.Email.email,
      avatar: user.cover?.type === 'external' ? user.cover.external.url : undefined,
    }))
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /contact GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
