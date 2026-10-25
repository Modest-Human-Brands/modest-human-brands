export default defineEventHandler(async (event) => {
  const orgSlug = await requireOrgSlug(event)
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)

  await getOwnSite(slug, orgSlug)

  return wapFetch<Site>(`/api/site/${slug}`, { method: 'PUT', orgSlug, body })
})
