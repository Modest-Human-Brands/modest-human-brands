import { createHmac } from 'node:crypto'
import { createError, defineEventHandler, getQuery } from 'h3'
import { encodeRecoveryKey } from 'matrix-js-sdk/lib/crypto-api'

interface MatrixLoginResponse {
  access_token: string
  device_id: string
  refresh_token?: string
}

interface MatrixAuthCacheEntry {
  accessToken: string
  deviceId: string
  refreshToken?: string
  updatedAt: number
  displayName?: string
}

const MATRIX_BASE_URL = import.meta.env.NUXT_PUBLIC_MATRIX_URL!
const MATRIX_ADMIN_TOKEN = import.meta.env.NUXT_PRIVATE_MATRIX_ADMIN_ACCESS_TOKEN!
const MATRIX_ACCOUNT_SECRET = import.meta.env.NUXT_MATRIX_ACCOUNT_SECRET ?? MATRIX_ADMIN_TOKEN

const normalizeEmail = (email: string) => email.trim().toLowerCase()
const getHomeserverName = () => new URL(MATRIX_BASE_URL).hostname
const sanitizeLocalpart = (value: string) => value.toLowerCase().replace(/[^a-z0-9._=-]/g, '_')
const buildMatrixUserId = (email: string) => `@${sanitizeLocalpart(email.split('@')[0] ?? email)}:${getHomeserverName()}`

const deriveStablePassword = (email: string) => createHmac('sha256', MATRIX_ACCOUNT_SECRET).update(`matrix-password:${email}`).digest('base64url').slice(0, 32)

const deriveStableRecoveryKey = (email: string) => encodeRecoveryKey(createHmac('sha256', MATRIX_ACCOUNT_SECRET).update(`matrix-recovery:${email}`).digest())!

async function matrixApi<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT',
  body:
    | { displayname?: string; password?: string; logout_devices?: boolean; refresh_token?: string | boolean; type?: string; identifier?: { type: string; user: string }; device_id?: string }
    | undefined,
  token?: string
): Promise<T> {
  return $fetch<T>(`${MATRIX_BASE_URL}${path}`, {
    method,
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
}

async function matrixUpsertUser(userId: string, password: string, displayname?: string) {
  await matrixApi(`/_synapse/admin/v2/users/${encodeURIComponent(userId)}`, 'PUT', { password, logout_devices: false, ...(displayname ? { displayname } : {}) }, MATRIX_ADMIN_TOKEN)
}

async function getCredentials(email: string, deviceId: string, displayName?: string): Promise<MatrixCredentials> {
  const matrixUserCredStorage = useStorage<{ userId: string; recoveryKey: string }>('data:auth:matrix:cred')
  const authStorage = useStorage<MatrixAuthCacheEntry>('data:auth:matrix')

  const normalized = normalizeEmail(email)
  const seeded = await matrixUserCredStorage.getItem(normalized)

  const userId = seeded?.userId ?? buildMatrixUserId(normalized)
  const password = deriveStablePassword(normalized)
  const recoveryKey = seeded?.recoveryKey ?? deriveStableRecoveryKey(normalized)

  const cacheKey = `${userId}:${deviceId}`
  const cached = await authStorage.get(cacheKey)

  const updateDisplayName = async (token: string) => {
    if (displayName && cached?.displayName !== displayName) {
      await matrixApi(`/_matrix/client/v3/profile/${encodeURIComponent(userId)}/displayname`, 'PUT', { displayname: displayName }, token).catch(() => null)

      if (cached) cached.displayName = displayName
    }
  }

  // ✅ reuse token
  if (cached?.accessToken) {
    try {
      const whoAmI = await matrixApi<{ user_id: string }>('/_matrix/client/v3/account/whoami', 'GET', undefined, cached.accessToken)

      if (whoAmI.user_id === userId) {
        await updateDisplayName(cached.accessToken)
        cached.updatedAt = Date.now()

        return {
          userId,
          accessToken: cached.accessToken,
          refreshToken: cached.refreshToken,
          deviceId: cached.deviceId,
          recoveryKey,
        }
      }
    } catch {
      //
    }
  }

  // ✅ refresh token
  if (cached?.refreshToken) {
    try {
      const refreshed = await matrixApi<MatrixLoginResponse>('/_matrix/client/v3/refresh', 'POST', { refresh_token: cached.refreshToken })

      cached.accessToken = refreshed.access_token
      cached.deviceId = refreshed.device_id || cached.deviceId
      cached.refreshToken = refreshed.refresh_token ?? cached.refreshToken
      cached.updatedAt = Date.now()

      await updateDisplayName(cached.accessToken)

      return {
        userId,
        accessToken: cached.accessToken,
        refreshToken: cached.refreshToken,
        deviceId: cached.deviceId,
        recoveryKey,
      }
    } catch {
      //
    }
  }

  const loginPayload = {
    type: 'm.login.password',
    identifier: { type: 'm.id.user', user: userId },
    password,
    refresh_token: true,
    device_id: deviceId,
  }

  try {
    const login = await matrixApi<MatrixLoginResponse>('/_matrix/client/v3/login', 'POST', loginPayload)

    await authStorage.set(cacheKey, {
      accessToken: login.access_token,
      deviceId: login.device_id || deviceId,
      refreshToken: login.refresh_token,
      displayName,
      updatedAt: Date.now(),
    })

    await updateDisplayName(login.access_token)

    return {
      userId,
      accessToken: login.access_token,
      deviceId: login.device_id || deviceId,
      recoveryKey,
    }
  } catch {
    // create user then retry
    await matrixUpsertUser(userId, password, displayName)

    const login = await matrixApi<MatrixLoginResponse>('/_matrix/client/v3/login', 'POST', loginPayload)

    await authStorage.set(cacheKey, {
      accessToken: login.access_token,
      deviceId: login.device_id || deviceId,
      refreshToken: login.refresh_token,
      displayName,
      updatedAt: Date.now(),
    })

    await updateDisplayName(login.access_token)

    return {
      userId,
      accessToken: login.access_token,
      deviceId: login.device_id || deviceId,
      recoveryKey,
    }
  }
}

export default defineEventHandler(async (event): Promise<MatrixCredentials> => {
  try {
    const { user } = await requireUserSession(event)
    if (!user?.email) {
      throw createError({ statusCode: 401, statusMessage: 'Missing user email' })
    }

    const query = getQuery(event)
    const deviceId = query.deviceId as string

    if (!deviceId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing client device identifier' })
    }

    return await getCredentials(user.email, deviceId, user.name || undefined)
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      if (error.statusCode === 400) {
        throw createError({ statusCode: 409, statusMessage: 'Matrix username already taken — contact admin' })
      }

      if (typeof error.statusCode === 'number') throw error
    }

    throw createError({ statusCode: 500, statusMessage: 'Unknown Matrix Auth Error' })
  }
})
