import { z } from 'zod'

const pathParamsSchema = z.object({ batchId: z.string() })

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { batchId } = await getValidatedRouterParams(event, pathParamsSchema.parse)

    return await $fetch(`/api/media/uploads/${batchId}`, {
      baseURL: config.public.driveUrl,
    })
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /drive/[projectId]/uploads/[batchId] GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
