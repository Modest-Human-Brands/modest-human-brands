export default defineEventHandler(async (event) => {
  const { data } = await readValidatedBody(event, completeUserFormSchema.safeParse)

  if (!data) return

  const { user } = await requireUserSession(event)

  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const query = await notion.dataSources.query({
    data_source_id: notionDbId.user,
    filter: {
      property: 'Email',
      email: { equals: user.email },
    },
  })

  if (query.results.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  let organizationPageId: string | undefined

  // Handle organization creation/selection
  if (data.organizationId === 'create-new' && data.organization) {
    const orgPage = await notion.pages.create({
      parent: { data_source_id: notionDbId.organization },
      properties: {
        Name: {
          type: 'title',
          title: [{ type: 'text', text: { content: data.organization.name } }],
        },
        'Founded Year': {
          type: 'number',
          number: data.organization.foundedYear,
        },
        User: {
          type: 'relation',
          relation: [{ id: query.results[0]!.id }],
        },
      },
    })

    organizationPageId = orgPage.id
  } else if (data.organizationId && data.organizationId !== 'create-new') {
    organizationPageId = data.organizationId
  }

  // Update user page with organization relation
  await notion.pages.update({
    page_id: query.results[0]!.id,
    properties: {
      Name: {
        type: 'title',
        title: [{ type: 'text', text: { content: changeCase(data.name, 'sentence') } }],
      },
      Status: {
        type: 'status',
        status: { name: 'Filled' },
      },
      DOB: {
        type: 'date',
        date: { start: data.dob },
      },
      Gender: {
        type: 'select',
        select: { name: changeCase(data.gender, 'sentence') },
      },
      Phone: {
        type: 'phone_number',
        phone_number: data.phone,
      },
      ...(organizationPageId && {
        Organization: {
          type: 'relation',
          relation: [{ id: organizationPageId }],
        },
      }),
    },
  })

  // Update session with organization data
  await replaceUserSession(
    event,
    {
      user: {
        id: user.id,
        name: changeCase(data.name, 'sentence'),
        email: user.email,
        avatar: user.avatar,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        organization: organizationPageId,
        isProfileComplete: true,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loggedInAt: new Date().toISOString(),
    },
    { maxAge: 30 * 24 * 60 * 60 * 1000 }
  )

  return { status: 'OK' }
})
