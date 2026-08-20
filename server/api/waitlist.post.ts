export default defineEventHandler(async (event) => {
  try {
    const { data, success, error: validationError } = await readValidatedBody(event, waitlistSchema.safeParse)

    if (!success || !data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: validationError?.issues[0]?.message || 'Invalid form data',
      })
    }

    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const existingEntries = await notionQueryDb<NotionWaitlist>(notion, notionDbId.waitlist, {
      filter: {
        or: [
          {
            property: 'Email',
            email: { equals: data.email },
          },
          {
            property: 'Phone',
            phone_number: { equals: data.phone },
          },
        ],
      },
    })

    console.log({ existingEntries })

    if (existingEntries.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'This email or phone number is already on the waitlist.',
      })
    }

    await notion.pages.create({
      parent: { data_source_id: notionDbId.waitlist },
      properties: {
        Name: {
          type: 'title',
          title: [{ type: 'text', text: { content: data.name } }],
        },
        Email: {
          type: 'email',
          email: data.email,
        },
        Phone: {
          type: 'phone_number',
          phone_number: data.phone,
        },
        Company: {
          type: 'rich_text',
          rich_text: [{ type: 'text', text: { content: data.company } }],
        },
        Description: {
          type: 'rich_text',
          rich_text: [{ type: 'text', text: { content: data.description } }],
        },
      },
    })

    return { status: 'OK' }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /waitlist POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
