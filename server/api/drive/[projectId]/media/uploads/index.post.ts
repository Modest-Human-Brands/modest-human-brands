interface UploadResponse {
  batchId: string
  uploads: {
    filename: string
    uploadId: string
    uploadUrl: string
  }[]
}

export default defineEventHandler(async (event) => {
  try {
    const projectId = notionNormalizeId(getRouterParam(event, 'projectId')!)
    const { files } = await readBody<{ files: unknown[] }>(event)
    const config = useRuntimeConfig()

    return await $fetch<UploadResponse>('/api/media/uploads', {
      method: 'POST',
      baseURL: config.public.driveUrl,
      headers: serviceHeaders('drive', { 'x-org-id': await getProjectOrgSlug(projectId!) }),
      body: { projectId, files },
    })
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /drive/[projectId]/uploads POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
