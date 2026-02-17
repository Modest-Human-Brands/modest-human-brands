export interface Organization {
  id: string
  name: string
  foundedYear: number
  invites: string[]
  ownerId: undefined
  createdAt: string
  updatedAt: string
}

export default defineEventHandler<Promise<Organization[]>>(async () => {
  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  const organizations = (await notionQueryDb<NotionOrganization>(notion, notionDbId.organization)).filter((a) => !!a)

  return organizations.map(({ properties, id }) => {
    return {
      id: id,
      name: notionTextStringify(properties.Name.title),
      foundedYear: properties['Founded Year'].number,
      invites: [],
      ownerId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})
