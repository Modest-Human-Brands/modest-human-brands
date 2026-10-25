export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  return wapFetch<SiteTemplateDetail>(`/api/site/template/${getRouterParam(event, 'id')}`)
})
