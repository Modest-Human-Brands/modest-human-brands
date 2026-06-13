import z from 'zod'
import type { OrganizationBranding } from '~~/shared/types'

const pathParamsSchema = z.object({ orgSlug: z.string() })

export default defineEventHandler<Promise<Organization>>(async (event) => {
  try {
    const { orgSlug } = await getValidatedRouterParams(event, pathParamsSchema.parse)

    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const organizations = (await notionQueryDb<NotionOrganization>(notion, notionDbId.organization)).filter((a) => !!a)
    const filteredOrganization = organizations.filter(({ properties }) => notionTextStringify(properties.Id.rich_text) === orgSlug)[0]

    if (!filteredOrganization) throw createError({ statusCode: 404, statusMessage: 'organization not found' })

    const organization: Organization = {
      id: filteredOrganization.id,
      name: notionTextStringify(filteredOrganization.properties.Name.title),
      website: filteredOrganization.properties.Website.url,
      branding: JSON.parse(notionTextStringify(filteredOrganization.properties.Branding.rich_text)) as OrganizationBranding,
      phone: filteredOrganization.properties.Phone.phone_number,
      whatsapp: filteredOrganization.properties.Whatsapp.url,
      invites: [],
      foundedYear: filteredOrganization.properties['Founded Year'].number,
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

    console.error('API organization/[orgSlug] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
