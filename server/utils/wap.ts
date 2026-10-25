import type { H3Event } from 'h3'

/** Slug of the signed-in user's active org: MWap scopes every site by it. */
export async function requireOrgSlug(event: H3Event): Promise<string> {
  const { user } = await requireUserSession(event)
  const slug = await getActiveOrgSlug(event, user)

  if (!slug) throw createError({ statusCode: 403, statusMessage: 'No active organization' })

  return slug
}

/** Calls MWap with its key and, for writes and org-scoped reads, the org slug. MWap's validation errors reach the browser as `data`. */
export async function wapFetch<T>(path: string, { orgSlug, ...options }: { orgSlug?: string; method?: 'GET' | 'POST' | 'PUT'; query?: Record<string, unknown>; body?: unknown } = {}): Promise<T> {
  const config = useRuntimeConfig()

  try {
    return (await $fetch(path, { ...options, baseURL: config.public.wapUrl, headers: serviceHeaders('wap', { 'x-org-id': orgSlug }) } as never)) as T
  } catch (error) {
    const { statusCode, statusMessage, data } = error as { statusCode?: number; statusMessage?: string; data?: { data?: unknown } }

    if (statusCode) throw createError({ statusCode, statusMessage, data: data?.data })

    console.error(`MWap ${path}`, error)
    throw createError({ statusCode: 502, statusMessage: 'MWap is unreachable' })
  }
}

/** A site of another org looks like an unknown slug, as in MWap's own replace. */
export async function getOwnSite(slug: string | undefined, orgSlug: string): Promise<Site> {
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Site slug is required' })

  const site = await wapFetch<Site>(`/api/site/${slug}`)

  if (site.orgId !== orgSlug) throw createError({ statusCode: 404, statusMessage: 'Site not found' })

  return site
}
