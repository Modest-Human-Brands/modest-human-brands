import type { NotificationSubscription } from './subscribe.post'

export default defineEventHandler(async (event) => {
  try {
    const { user, deviceId } = await requireUserSession(event)
    const pushStorage = useStorage<NotificationSubscription>('data:subscription:notification')

    const result = await pushStorage.removeItem(`${user.id}-${deviceId}`)

    return { success: result }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API notification/push/unsubscribe DELETE', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
