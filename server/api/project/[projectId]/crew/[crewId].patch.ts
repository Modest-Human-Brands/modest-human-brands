import z from 'zod'

const optionalText = z.string().trim().max(2000)

const bodySchema = z
  .object({
    name: optionalText,
    department: optionalText,
    role: optionalText,
    status: optionalText.min(1),
    rate: z.number().nullable(),
    rateType: optionalText,
    totalAgreedRate: z.number().nullable(),
    email: optionalText,
    phone: optionalText,
    portfolioLink: optionalText.refine((value) => !value || URL.canParse(value), 'Portfolio link must be a valid URL'),
    location: optionalText,
    notes: optionalText,
  })
  .partial()

const richText = (value: string) => (value ? [{ text: { content: value } }] : [])
const select = (value: string) => (value ? { name: value } : null)

export default defineEventHandler<Promise<ProjectCrewMember>>(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const projectId = notionNormalizeId(getRouterParam(event, 'projectId'))
    const crewId = notionNormalizeId(getRouterParam(event, 'crewId'))
    if (!projectId || !crewId) throw createError({ statusCode: 400, statusMessage: 'Project and crew ID are required' })

    const body = await readValidatedBody(event, bodySchema.parse)

    const project = (await useStorage<Resource<'project'>>('data:resource:project').getItem(projectId))?.record
    assertProjectInOrg(project, getActiveOrgId(event, user))

    // Only members linked to this project can be edited through it
    const crewStorage = useStorage<Resource<'crew'>>('data:resource:crew')
    const record = (await crewStorage.getItem(crewId))?.record
    if (!record || !(record.properties.Project?.relation ?? []).some(({ id }) => notionNormalizeId(id) === projectId)) {
      throw createError({ statusCode: 404, statusMessage: 'Crew member not found' })
    }

    const properties: Record<string, unknown> = {}
    if (body.name !== undefined) properties.Name = { title: richText(body.name) }
    if (body.department !== undefined) properties.Department = { select: select(body.department) }
    if (body.role !== undefined) {
      properties.Role = {
        multi_select: body.role
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      }
    }
    if (body.status !== undefined) properties.Status = { status: { name: body.status } }
    if (body.rate !== undefined) properties.Rate = { number: body.rate }
    if (body.rateType !== undefined) properties['Rate Type'] = { select: select(body.rateType) }
    if (body.totalAgreedRate !== undefined) properties['Total Agreed Rate'] = { number: body.totalAgreedRate }
    if (body.email !== undefined) properties.Email = { email: body.email || null }
    if (body.phone !== undefined) properties.Phone = { phone_number: body.phone || null }
    if (body.portfolioLink !== undefined) properties['Portfolio / Reel Link'] = { url: body.portfolioLink || null }
    if (body.location !== undefined) properties.Location = { rich_text: richText(body.location) }
    if (body.notes !== undefined) properties.Notes = { rich_text: richText(body.notes) }

    // Notion first, so the cache never holds a value Notion rejected
    const page = (await notion.pages.update({ page_id: record.id, properties: properties as never })) as unknown as NotionCrew
    await crewStorage.setItem(crewId, { type: 'crew', notificationStatus: false, record: page })

    return mapCrewMember(page)
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    console.error('API project/[projectId]/crew/[crewId] PATCH', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update crew member' })
  }
})
