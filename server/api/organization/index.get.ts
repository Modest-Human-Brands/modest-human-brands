export default defineEventHandler<Promise<Organization[]>>(async () => {
  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const organizations = (await notionQueryDb<NotionOrganization>(notion, notionDbId.organization)).filter((a) => !!a)

  return organizations.map(({ properties, id }) => {
    return {
      id: id,
      name: notionTextStringify(properties.Name.title),
      website: 'https://redcatpictures.com',
      branding: {
        logo: 'https://redcatpictures.com/logo-light.svg',
        color: {
          primary: '#CD2D2D',
          accent: '',
        },
        font: '',
      },
      phone: '+912269711501',
      whatsapp: 'https://wa.me/912269711501',
      invites: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      foundedYear: properties['Founded Year'].number,
      ownerId: '',
      /* socials: {
  instagram: 'https://www.instagram.com/redcatpictures',
  facebook: 'https://www.facebook.com/redcatpictures',
  youtube: "https://www.youtube.com/@red_cat_pictures",
} */
    }
  })
})
