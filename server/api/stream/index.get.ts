export default defineEventHandler<Promise<Stream[]>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return []

  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  console.log({ notionDbId })

  // const project = (
  //   await notionQueryDb<NotionProject>(notion, notionDbId.project, {
  //     filter: {
  //       property: 'Organization',
  //       relation: {
  //         contains: activeOrg,
  //       },
  //     },
  //   })
  // ).filter((a) => !!a)

  return await $fetch<Stream[]>('http://localhost:3111/stream/status')
})
