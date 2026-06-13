import type { OrganizationBranding } from '~~/shared/types'

export default defineEventHandler<Promise<Organization[]>>(async () => {
  try {
    const config = useRuntimeConfig()
    const notionDbId = config.private.notionDbId as unknown as NotionDB

    const organizations = (await notionQueryDb<NotionOrganization>(notion, notionDbId.organization)).filter((a) => !!a)

    return organizations.map(({ properties, id }) => {
      return {
        id,
        name: notionTextStringify(properties.Name.title),
        website: properties.Website.url,
        branding: JSON.parse(notionTextStringify(properties.Branding.rich_text)) as OrganizationBranding,
        phone: properties.Phone.phone_number,
        whatsapp: properties.Whatsapp.url,
        invites: [],
        foundedYear: properties['Founded Year'].number,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: '',
        /* socials: {
          instagram: 'https://www.instagram.com/redcatpictures',
          facebook: 'https://www.facebook.com/redcatpictures',
          youtube: "https://www.youtube.com/@red_cat_pictures",
        } */
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API organization GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
