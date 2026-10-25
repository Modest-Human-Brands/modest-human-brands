interface MDriveProjectResponse {
  data: {
    id: string
    slug: string
    title: string
    date: string
    status: string
    mediaCount: {
      photo: number
      video: number
    }
    previewImages: never[]
  }[]
  totalItems: number
}

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const activeOrgId = getActiveOrgId(event, user)

    if (!activeOrgId) return { data: [], totalItems: 0 }

    const config = useRuntimeConfig()

    const response = await $fetch<MDriveProjectResponse>('/api/projects', {
      baseURL: config.public.driveUrl,
      headers: serviceHeaders('drive'),
    })

    const { ids } = await getOrgProjects(activeOrgId)
    const data = response.data.filter((project) => ids.has(notionNormalizeId(project.id)!))

    return { ...response, data, totalItems: data.length }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /drive GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
