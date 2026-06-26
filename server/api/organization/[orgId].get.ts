import z from 'zod'

const pathParamsSchema = z.object({ orgId: z.string() })

export default defineEventHandler<Promise<Organization>>(async (event) => {
  try {
    const { orgId } = await getValidatedRouterParams(event, pathParamsSchema.parse)

    const organizationData = (await notion.pages.retrieve({ page_id: orgId })) as unknown as NotionOrganization
    const properties = organizationData.properties

    const socialLinksText = notionTextStringify(properties['Social Links'].rich_text)
    const accountDetailsText = notionTextStringify(properties['Account Details'].rich_text)
    const brandingText = notionTextStringify(properties.Branding.rich_text)

    const organization: Organization = {
      id: organizationData.id,
      name: notionTextStringify(properties.Name.title),
      legalName: notionTextStringify(properties['Legal Name'].rich_text),
      entityType: properties['Entity Type'].select!.name,
      tradeRelationship: properties['Trade Relationship'].select!.name,
      gstin: notionTextStringify(properties.GSTIN.rich_text),
      pan: notionTextStringify(properties.PAN.rich_text),
      address: notionTextStringify(properties.Address.rich_text),
      accountDetails: JSON.parse(accountDetailsText) as OrganizationAccountDetails,
      contactEmail: properties['Contact Email'].email!,
      billingEmail: properties['Billing Email'].email!,
      website: properties.Website.url,
      branding: JSON.parse(brandingText) as OrganizationBranding,
      phone: properties.Phone.phone_number,
      whatsapp: properties.Whatsapp.url,
      socials: JSON.parse(socialLinksText) as OrganizationSocials,
      foundedYear: properties['Founded Year'].number,

      primaryContactId: properties['Primary Contact'].relation.map((r) => r.id)[0]!,
      organizationMemberIds: properties['Organization Members'].relation.map((r) => r.id),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
