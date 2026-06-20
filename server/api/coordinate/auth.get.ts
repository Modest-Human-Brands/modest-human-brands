export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user

  const config = useRuntimeConfig()
  const matrixCredentialsStorage = useStorage<{ password: string; recoveryKey: string }>('data:matrix:cred')

  const synapseUrl = config.public.matrixUrl
  const matrixUserId = `@${user.name.toLowerCase().replaceAll(' ', '.')}:synapse.modesthumanbrands.com`
  const matrixCredentialsData = await matrixCredentialsStorage.getItem(matrixUserId)

  // await matrixCredentialsStorage.setItem(matrixUserId, {
  //   password: 'test',
  //   recoveryKey: 'test',
  // },)

  const query = getQuery(event)
  const deviceId = (query.deviceId as string) || `WEB_${Date.now()}`

  try {
    const response = await $fetch<{ access_token: string }>(`/_matrix/client/v3/login`, {
      baseURL: synapseUrl,
      method: 'POST',
      body: {
        type: 'm.login.password',
        identifier: {
          type: 'm.id.user',
          user: matrixUserId,
        },
        password: matrixCredentialsData!.password,
        device_id: deviceId,
        initial_device_display_name: 'Modest Human Brands Web',
      },
    })

    return {
      userId: matrixUserId,
      accessToken: response.access_token,
      deviceId,
      homeserverUrl: synapseUrl,
      recoveryKey: matrixCredentialsData!.recoveryKey,
    }
  } catch (error) {
    console.error('API coordinate/auth GET', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to negotiate Matrix session' })
  }
})
