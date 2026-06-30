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
    const body = await readBody(event)
    const config = useRuntimeConfig()

    return await $fetch<UploadResponse>('/api/media/uploads', {
      method: 'POST',
      baseURL: config.public.driveUrl,
      body,
    })
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /drive/[projectId]/uploads GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
