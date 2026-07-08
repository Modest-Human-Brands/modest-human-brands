export async function transformTemplate(variables: Record<string, string>) {
  if ('organization' in variables) {
    delete variables['organization']
  }

  if ('project' in variables) {
    try {
      const projects = await $fetch<{ id: string; title: string }[]>('/api/project')
      variables['project'] = `enum:${projects.map((p) => `${p.id}|${p.title}`).join(',')}`
    } catch (error) {
      console.error('Failed to fetch projects for enum transformation:', error)
      variables['project'] = 'enum:'
    }
  }

  if ('terms' in variables) {
    try {
      const terms = await $fetch<{ id: string; slug: string; title: string }[]>('/api/compliance')
      variables['terms'] = `enum:${terms.map((t) => `${t.slug || t.id}|${t.title}`).join(',')}`
    } catch (error) {
      console.error('Failed to fetch terms for enum transformation:', error)
      variables['terms'] = 'enum:'
    }
  }

  return variables
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function retransformTemplate({ data, orgId }: { data: any; orgId: string }) {
  let organization = null
  try {
    organization = await $fetch(`/api/organization/${orgId}`)
  } catch (error) {
    console.error(`[retransformTemplate] Failed to fetch organization (${orgId}):`, error)
  }

  const mdocData = data || {}

  mdocData.organization = organization

  // Extract 'id' if the frontend submitted the rich object { id, name }
  const targetTermsId = typeof mdocData.terms === 'object' ? mdocData.terms?.id : mdocData.terms
  if (targetTermsId && typeof targetTermsId === 'string') {
    try {
      const terms = await $fetch<{
        id: string
        slug: string
        title: string
        updatedAt: string
        content: Record<string, string>
        markdown: string
      }>(`/api/compliance/${targetTermsId}`)

      mdocData.terms = { content: terms.markdown, lastUpdated: terms.updatedAt }
    } catch (error) {
      console.error(`[retransformTemplate] Failed to fetch compliance terms (${targetTermsId}):`, error)
      mdocData.terms = { content: '', lastUpdated: null }
    }
  }

  // Extract 'id' if the frontend submitted the rich object { id, name }
  const targetProjectId = typeof mdocData.project === 'object' ? mdocData.project?.id : mdocData.project
  if (targetProjectId && typeof targetProjectId === 'string') {
    try {
      const project = await $fetch(`/api/project/${targetProjectId}`)
      mdocData.project = project
    } catch (error) {
      console.error(`[retransformTemplate] Failed to fetch project (${targetProjectId}):`, error)
      mdocData.project = null
    }
  }

  return { organization, mdocData }
}
