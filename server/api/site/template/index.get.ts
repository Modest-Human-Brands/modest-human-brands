export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  return wapFetch<SiteTemplate[]>('/api/site/template')
})
