export default defineEventHandler(async (event) => getOwnSite(getRouterParam(event, 'slug'), await requireOrgSlug(event)))
