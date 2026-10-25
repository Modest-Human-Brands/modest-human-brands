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

/** Ids and slugs of the active org's projects, from the Notion cache. Documents and drive rows are matched against these. */
export async function getOrgProjects(activeOrgId: string | undefined) {
  const ids = new Set<string>()
  const slugs = new Set<string>()
  if (!activeOrgId) return { ids, slugs }

  const storage = useStorage<Resource<'project'>>('data:resource:project')
  const items = await storage.getItems(await storage.getKeys())

  for (const { value } of items) {
    const record = value?.record
    if (!record?.properties || !hasActiveOrg(record, activeOrgId)) continue

    ids.add(notionNormalizeId(record.id)!)
    const slug = record.properties.Slug?.formula?.string
    if (slug) slugs.add(slug)
  }

  return { ids, slugs }
}

type OrgProjects = Awaited<ReturnType<typeof getOrgProjects>>

/** A document belongs to the active org through its organization or through one of the org's projects. */
export function isDocInOrg(
  doc: { organizationId?: string | null; projectId?: string | null; project?: { id?: string | null; slug?: string } | null },
  activeOrgId: string | undefined,
  orgProjects: OrgProjects
): boolean {
  if (!activeOrgId) return false
  if (doc.organizationId && notionNormalizeId(doc.organizationId) === notionNormalizeId(activeOrgId)) return true
  if (doc.projectId && orgProjects.ids.has(notionNormalizeId(doc.projectId)!)) return true
  if (doc.project?.id && orgProjects.ids.has(notionNormalizeId(doc.project.id)!)) return true

  return !!doc.project?.slug && orgProjects.slugs.has(doc.project.slug)
}

/** Fetches one MDoc document and throws 404 unless it belongs to the active org. */
export async function assertDocInOrg(docId: string, activeOrgId: string | undefined): Promise<void> {
  const config = useRuntimeConfig()
  const doc = await $fetch<{ organizationId?: string | null; projectId?: string | null }>(`/api/document/${docId}`, { baseURL: config.public.docUrl, headers: serviceHeaders('doc') })

  if (!isDocInOrg(doc, activeOrgId, await getOrgProjects(activeOrgId))) throw createError({ statusCode: 404, statusMessage: 'Document not found' })
}

/** MConnect and MDrive identify an org by the slug kept in its Notion `Id` property, not by the page id. */
export async function getOrgSlug(orgId: string | undefined): Promise<string | undefined> {
  if (!orgId) return undefined

  const item = await useStorage<Resource<'organization'>>('data:resource:organization').getItem(notionNormalizeId(orgId)!)

  const slug = notionTextStringify(item?.record?.properties?.Id?.rich_text ?? [])

  return slug || undefined
}

export function getActiveOrgSlug(event: H3Event, user: { organizations?: { orgId: string }[] }): Promise<string | undefined> {
  return getOrgSlug(getActiveOrgId(event, user))
}

/** The slug of the org that owns a project, so uploads work for any caller without trusting the request body. */
export async function getProjectOrgSlug(projectId: string): Promise<string> {
  const project = await useStorage<Resource<'project'>>('data:resource:project').getItem(notionNormalizeId(projectId)!)
  const relation = (project?.record?.properties as { Organization?: { relation?: { id: string }[] } } | undefined)?.Organization?.relation
  const slug = await getOrgSlug(relation?.[0]?.id)

  if (!slug) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  return slug
}
