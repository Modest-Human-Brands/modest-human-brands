import type { H3Event } from 'h3'

/**
 * Org the request acts on: the `active-org-id` cookie if the user belongs to it,
 * otherwise their first organization. `undefined` when the user has none.
 */
export function getActiveOrgId(event: H3Event, user: { organizations?: { orgId: string }[] }): string | undefined {
  const cookieOrgId = getCookie(event, 'active-org-id')

  return user.organizations?.find((org) => org.orgId === cookieOrgId)?.orgId ?? user.organizations?.[0]?.orgId
}

/** True when the record's `Organization` relation contains the active org. A record with no organization belongs to nobody. */
export function hasActiveOrg(record: { properties?: object } | undefined, activeOrgId: string | undefined): boolean {
  const relation = (record?.properties as { Organization?: { relation?: { id: string }[] } } | undefined)?.Organization?.relation ?? []

  return !!activeOrgId && relation.some((r) => notionNormalizeId(r.id) === notionNormalizeId(activeOrgId))
}

/** Throws 404 unless the project belongs to the active org, so other orgs' project ids look nonexistent. */
export function assertProjectInOrg(record: { properties?: object } | undefined, activeOrgId: string | undefined): void {
  if (!hasActiveOrg(record, activeOrgId)) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}
