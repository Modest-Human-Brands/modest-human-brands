export async function transformTemplate(variables: Record<string, string>) {
  if ('organization' in variables) {
    delete variables['organization']
  }

  if ('project' in variables) {
    try {
      const projects = await $fetch('/api/project')
      variables['project'] = `enum:${projects.map((p) => p.id).join(',')}`
    } catch (error) {
      console.error('Failed to fetch projects for enum transformation:', error)
      variables['project'] = 'enum:'
    }
  }

  return variables
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function retransformTemplate({ data, orgId }: { data: any; orgId: string }) {
  const organization = await $fetch(`/api/organization/${orgId}`)

  const mdocData = data || {}

  mdocData.organization = organization

  const targetProjectId = mdocData.project
  if (targetProjectId) {
    const project = await $fetch(`/api/project/${targetProjectId}`)
    mdocData.project = project
  }

  return { organization, mdocData }
}
