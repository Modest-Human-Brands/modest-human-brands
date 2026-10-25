export default defineEventHandler(async (event) => {
  const orgSlug = await requireOrgSlug(event)

  const response = await wapFetch<{ results: SiteSummary[] }>('/api/site', { query: { org: orgSlug, limit: 100, offset: 0 } })

  return response.results
})
