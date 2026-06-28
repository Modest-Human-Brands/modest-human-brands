interface DocumentMeta {
  id: string
  name: string
  fileName: string
  extension: string
  sizeBytes: number
  templateId: string
  previewUrl: string
  createdAt: string
  updatedAt: string
}

interface ProjectDocuments {
  slug: string
  title: string
  date: string
  status: 'Plan' | 'Quotation' | 'Shoot' | 'Edit' | 'Delivered'
  client:
    | {
        name: string
        avatar: string | undefined
      }
    | undefined
  documentCount: number
  documentItems: DocumentMeta[]
}

export default defineEventHandler<Promise<ProjectDocuments | undefined>>(async (event) => {
  try {
    const config = useRuntimeConfig()
    const slug = getRouterParam(event, 'projectSlug')!.toString().replace(/,$/, '')

    // const documentStorage = useStorage<Resource<'media'>>(`data:resource:media`)
    const projectStorage = useStorage<Resource<'project'>>(`data:resource:project`)
    const clientStorage = useStorage<Resource<'client'>>(`data:resource:client`)

    // const documents = (await documentStorage.getItems(await documentStorage.getKeys())).flatMap(({ value }) => value.record)

    const projects = (await projectStorage.getItems(await projectStorage.getKeys())).flatMap(({ value }) => value.record)

    const clients = (await clientStorage.getItems(await clientStorage.getKeys())).flatMap(({ value }) => value.record)

    const filteredProject = projects.filter(({ properties }) => properties.Slug.formula.string === slug)[0]

    if (!filteredProject) return

    const projectClient = clients.filter(({ properties }) => properties.Project.relation.some(({ id }) => id === filteredProject.id))[0]

    const documentItems = await $fetch<DocumentMeta[]>('/api/document', { baseURL: config.public.docUrl })
    // const projectDocuments = documents.filter((a) => a.properties['Project Slug'].rollup.array[0]?.formula.string === filteredProject.properties.Slug.formula.string)

    // const projectDocumentItems = projectDocuments
    //   .map<DocumentItem>(({ properties, cover }) => ({
    //     slug: properties.Slug.formula.string,
    //     title: notionTextStringify(properties.Name.title),
    //     type: properties.Type.select.name.toLowerCase() as 'pdf',
    //     thumbnailUrl: cover?.type === 'external' ? cover.external.url : undefined,
    //     document: properties.Slug.formula.string,
    //     metadata: {
    //       size: 22,
    //     },
    //     // uploadDate:'',
    //     // url:'',
    //   }))
    //   .toSorted((a, b) => a.slug.localeCompare(b.slug))

    return {
      slug: filteredProject.properties.Slug.formula.string,
      title: notionTextStringify(filteredProject.properties.Name.title),
      date: filteredProject.properties.Date.date.start,
      status: filteredProject.properties.Status.status.name,
      client: projectClient
        ? {
            name: notionTextStringify(projectClient.properties.Name.title),
            avatar: projectClient.cover?.type === 'external' ? projectClient.cover.external.url : undefined,
          }
        : undefined,
      documentCount: documentItems.length,
      documentItems,
    } as ProjectDocuments
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API document/[projectSlug] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
