export interface NotificationSubscription {
  endpoint: string
  expirationTime: null
  keys: {
    p256dh: string
    auth: string
  }
  organizations?: string[]
}

export default defineEventHandler(async (event) => {
  try {
    const { user, deviceId } = await requireUserSession(event)
    const pushStorage = useStorage<NotificationSubscription>('data:subscription:notification')

    const body = await readBody<NotificationSubscription>(event)
    body.organizations = user?.organizations || []

    await pushStorage.setItem(`${user.id}-${deviceId}`, body)

    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API notification/push/subscribe POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
