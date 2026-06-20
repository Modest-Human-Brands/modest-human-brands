import z from 'zod'
import type { NotionOrganization, OrganizationBranding } from '~~/shared/types'

const pathParamsSchema = z.object({ orgId: z.string() })

export default defineEventHandler<Promise<Organization>>(async (event) => {
  try {
    const { orgId } = await getValidatedRouterParams(event, pathParamsSchema.parse)

    const organizationData = (await notion.pages.retrieve({ page_id: orgId })) as unknown as NotionOrganization

    const organization: Organization = {
      id: organizationData.id,
      name: notionTextStringify(organizationData.properties.Name.title),
      address: notionTextStringify(organizationData.properties.Address.rich_text),
      website: organizationData.properties.Website.url,
      branding: JSON.parse(notionTextStringify(organizationData.properties.Branding.rich_text)) as OrganizationBranding,
      phone: organizationData.properties.Phone.phone_number,
      whatsapp: organizationData.properties.Whatsapp.url,
      invites: [],
      foundedYear: organizationData.properties['Founded Year'].number,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: '',
      /* socials: {
        instagram: 'https://www.instagram.com/redcatpictures',
        facebook: 'https://www.facebook.com/redcatpictures',
        youtube: "https://www.youtube.com/@red_cat_pictures",
      } */
    }

    return organization
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /organization/[orgId] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
