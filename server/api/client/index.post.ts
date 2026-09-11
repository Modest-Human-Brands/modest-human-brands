interface CreateClientBody {
  name: string
  company?: string
  type?: string
  status?: string
  email?: string
  phone?: string
  pocName?: string
  pocEmail?: string
  pocPhone?: string
  address?: string
}

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const cookieOrgId = getCookie(event, 'active-org-id')
    const activeOrgId = user.organizations?.find((org) => org.orgId === cookieOrgId)?.orgId ?? user.organizations?.[0]?.orgId

    if (!activeOrgId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Active organization ID is required',
      })
    }

    const body = await readBody<CreateClientBody>(event)

    if (!body?.name?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client or Brand Name is required',
      })
    }

    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {
      Name: {
        type: 'title',
        title: [{ type: 'text', text: { content: body.name.trim() } }],
      },
      Organization: {
        type: 'relation',
        relation: [{ id: activeOrgId }],
      },
    }

    if (body.company?.trim()) {
      properties.Company = {
        type: 'rich_text',
        rich_text: [{ type: 'text', text: { content: body.company.trim() } }],
      }
    }

    if (body.type?.trim()) {
      properties.Type = {
        type: 'select',
        select: { name: body.type.trim() },
      }
    }

    if (body.status?.trim()) {
      properties.Status = {
        type: 'status',
        status: { name: body.status.trim() },
      }
    }

    if (body.email?.trim()) {
      properties.Email = {
        type: 'email',
        email: body.email.trim(),
      }
    }

    if (body.phone?.trim()) {
      properties.Phone = {
        type: 'phone_number',
        phone_number: body.phone.trim(),
      }
    }

    if (body.address?.trim()) {
      properties.Address = {
        type: 'rich_text',
        rich_text: [{ type: 'text', text: { content: body.address.trim() } }],
      }
    }

    if (body.pocName?.trim()) {
      properties['PoC Person'] = {
        type: 'rich_text',
        rich_text: [{ type: 'text', text: { content: body.pocName.trim() } }],
      }
    }

    if (body.pocEmail?.trim()) {
      properties['PoC Email'] = {
        type: 'email',
        email: body.pocEmail.trim(),
      }
    }

    if (body.pocPhone?.trim()) {
      properties['PoC Phone'] = {
        type: 'phone_number',
        phone_number: body.pocPhone.trim(),
      }
    }

    const page = (await notion.pages.create({
      parent: { data_source_id: notionDbId.contact },
      properties,
    })) as unknown as NotionContact

    // Cache record in Nitro storage
    const storage = useStorage<Resource<'contact'>>('data:resource:contact')
    await storage.setItem(notionNormalizeId(page.id)!, {
      type: 'contact',
      notificationStatus: false,
      record: page,
    })

    return {
      success: true,
      id: page.id,
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /client POST', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create client',
    })
  }
})
