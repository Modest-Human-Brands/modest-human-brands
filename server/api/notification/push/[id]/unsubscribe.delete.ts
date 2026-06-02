import type { NotificationSubscription } from '../subscribe.post'
import { z } from 'zod'

const pathParamsSchema = z.object({ id: z.string() })

export default defineEventHandler(async (event) => {
  try {
    const { id } = await getValidatedRouterParams(event, pathParamsSchema.parse)
    const pushStorage = useStorage<NotificationSubscription>('data:subscription:notification')

    const result = await pushStorage.removeItem(id)

    return { success: result }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API notification/push/[id]/unsubscribe DELETE', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
