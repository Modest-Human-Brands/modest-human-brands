export default defineEventHandler<Promise<Stream | undefined>>(async (event) => {
  const { user } = await requireUserSession(event)

  const activeOrg = user.organizations[0]

  if (!activeOrg) return

  const config = useRuntimeConfig()
  const notionDbId = config.private.notionDbId as unknown as NotionDB

  console.log({ notionDbId })

  const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

  /*   const project = (
      await notionQueryDb<NotionProject>(notion, notionDbId.project, {
        filter: {
          property: 'Organization',
          relation: {
            contains: activeOrg,
          },
        },
      })
    ).filter((a) => !!a) */

  const streams = await $fetch<Stream[]>(`${config.public.driveUrl}/stream/status`)
  return streams.find((v) => v.slug === slug)!
})
