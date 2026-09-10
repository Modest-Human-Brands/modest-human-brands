export async function findOrCreateNotionUser(authUser: { sub?: string; name?: string; picture?: string; email: string }): Promise<{
  id: string
  name: string
  avatar?: string
  email: string
  createdAt: string
  updatedAt: string
  isProfileComplete: boolean
  organizations: {
    orgId: string
    orgName: string
    orgLogo?: string
  }[]
}> {
  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const results = await notionQueryDb(notion, notionDbId.user, {
    filter: {
      property: 'Email',
      email: { equals: authUser.email },
    },
  })

  if (results.length > 0) {
    const data = results[0] as unknown as NotionUser

    const organizations = await Promise.all(
      data.properties.Organization.rollup.array.map(async ({ relation }) => {
        const orgId = relation[0]!.id
        const orgPage = (await notion.pages.retrieve({ page_id: orgId })) as unknown as NotionOrganization
        const orgLogo = orgPage.icon?.type === 'external' ? orgPage.icon.external.url : orgPage.icon?.type === 'file' ? orgPage.icon.file.url : undefined

        return {
          orgId,
          orgName: notionTextStringify(orgPage.properties.Name?.title),
          orgLogo,
        }
      })
    )

    return {
      id: data.id,
      name: notionTextStringify(data.properties.Name.title),
      avatar: data.cover?.type === 'external' ? data.cover?.external.url : authUser.picture,
      email: data.properties.Email.email || '',
      createdAt: data.created_time || new Date().toISOString(),
      updatedAt: data.last_edited_time || new Date().toISOString(),
      isProfileComplete: data.properties.Status.status.name !== 'Unfilled',
      organizations,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await notion.pages.create({
    parent: { data_source_id: notionDbId.user },
    ...(authUser.picture && {
      cover: {
        type: 'external',
        external: { url: authUser.picture },
      },
    }),
    properties: {
      ...(authUser.name && {
        Name: {
          type: 'title',
          title: [{ type: 'text', text: { content: authUser.name } }],
        },
      }),
      Email: { type: 'email', email: authUser.email },
    },
  })

  return {
    id: data.id,
    name: notionTextStringify(data.properties.Name.title),
    avatar: data.cover?.external.url || authUser.picture,
    email: data.properties.Email.email || '',
    createdAt: data.created_time || new Date().toISOString(),
    updatedAt: data.last_edited_time || new Date().toISOString(),
    isProfileComplete: false,
    organizations: [],
  }
}

export default defineOAuthGoogleEventHandler({
  config: {},
  async onSuccess(event, { user: data }) {
    const user = await findOrCreateNotionUser(data)

    await setUserSession(
      event,
      {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isProfileComplete: user.isProfileComplete,
          organizations: user.organizations,
        },
        loggedInAt: new Date().toISOString(),
      },
      { maxAge: 30 * 24 * 60 * 60 * 1000 }
    )

    return sendRedirect(event, user.isProfileComplete ? '/dashboard' : '/auth/signup')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/')
  },
})
