export default defineEventHandler(async (event) => {
  const orgSlug = await requireOrgSlug(event)
  const body = await readBody(event)

  return wapFetch<Site>('/api/site', { method: 'POST', orgSlug, body })
})
