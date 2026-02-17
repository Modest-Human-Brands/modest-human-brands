export default defineEventHandler<Promise<User[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const users = (
    await notionQueryDb<NotionUser>(notion, notionDbId.user, {
      filter: {
        property: 'Organization',
        relation: {
          contains: activeOrg,
        },
      },
    })
  ).filter((a) => !!a)

  return users.map((user) => ({
    id: user.id,
    name: notionTextStringify(user.properties.Name.title),
    email: user.properties.Email.email,
    avatar: user.cover?.type === 'external' ? user.cover.external.url : undefined,
  }))
})
