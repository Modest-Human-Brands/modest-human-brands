export interface FormattedProject {
  id: string
  title: string
  slug: string
  status: ProjectStatus
  quotation?: number
  budget?: number
  address?: string
  dateStart?: string
  dateEnd?: string
  coverUrl?: string
  iconUrl?: string
  assetCount: number
  contactCount: number
}

export default defineEventHandler(async (_event) => {
  try {
    // await requireUserSession(event)

    const projectStorage = useStorage<Resource<'project'>>('data:resource:project')
    const keys = await projectStorage.getKeys()

    const projects: FormattedProject[] = []

    await Promise.all(
      keys.map(async (key) => {
        const record = (await projectStorage.getItem(key))?.record
        if (!record || !record.properties) return

        const props = record.properties
        const name = props.Name?.title?.[0]?.plain_text || 'Untitled Project'
        const slug = props.Slug?.formula?.string || record.id

        // Extract image URLs if available
        let coverUrl: string | undefined
        if (record.cover?.type === 'file') coverUrl = record.cover.file.url
        else if (record.cover?.type === 'external') coverUrl = record.cover.external.url

        let iconUrl: string | undefined
        if (record.icon?.type === 'file') iconUrl = record.icon.file.url
        else if (record.icon?.type === 'external') iconUrl = record.icon.external.url

        projects.push({
          id: record.id,
          title: name,
          slug,
          status: (props.Status?.status?.name as ProjectStatus) || 'Plan',
          budget: props.Budget?.number || undefined,
          shootLocation: props.Address?.rich_text?.[0]?.text?.content || undefined,
          shootDate: props.Date?.date?.start || undefined,
          quoteNumber: props.Quotation?.number || undefined,
          coverUrl,
          iconUrl,
          assetCount: props.Asset?.relation?.length || 0,
          contactCount: props.Contact?.relation?.length || 0,
        })
      })
    )

    // Sort descending by start date, falling back to ID
    return projects.sort((a, b) => {
      if (a.dateStart && b.dateStart) {
        return new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime()
      }
      return 0
    })
  } catch (error) {
    console.error('API /project/index GET', error)

    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch project registry',
    })
  }
})
