import * as sdk from 'matrix-js-sdk'
import { ClientEvent } from 'matrix-js-sdk'
import { decodeRecoveryKey } from 'matrix-js-sdk/lib/crypto-api'

import { logger } from 'matrix-js-sdk/lib/logger'

logger.disableAll()

const matrixClient = ref<sdk.MatrixClient | null>(null)
const isReady = ref(false)

let initPromise: Promise<sdk.MatrixClient | null> | null = null

const clearMatrixStores = async (): Promise<void> => {
  window.localStorage.removeItem('matrix_device_id')

  const dbs = ['matrix-web-store', 'matrix-crypto-store', 'matrix-rust-sdk:crypto']
  for (const db of dbs) {
    try {
      await new Promise((resolve, reject) => {
        const req = window.indexedDB.deleteDatabase(db)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(new Error('Failed to delete database'))
      })
    } catch {
      /* ignore */
    }
  }
}

export const useMatrix = () => {
  const initClient = (): Promise<sdk.MatrixClient | null> => {
    if (!import.meta.client) return Promise.resolve(null)
    if (matrixClient.value) return Promise.resolve(matrixClient.value)

    if (!initPromise) {
      initPromise = (async () => {
        try {
          let deviceId = window.localStorage.getItem('matrix_device_id')
          if (!deviceId) {
            deviceId = `WEB_${Date.now()}`
            window.localStorage.setItem('matrix_device_id', deviceId)
          }

          const credentials = await $fetch<{
            homeserverUrl: string
            accessToken: string
            userId: string
            recoveryKey: string
          }>(`/api/coordinate/auth?deviceId=${deviceId}`)

          const store = new sdk.IndexedDBStore({
            indexedDB: window.indexedDB,
            localStorage: window.localStorage,
            dbName: 'matrix-web-store',
          })

          const client = sdk.createClient({
            baseUrl: credentials.homeserverUrl,
            accessToken: credentials.accessToken,
            userId: credentials.userId,
            deviceId: deviceId,
            store: store,
            logger: undefined,
            cryptoCallbacks: {
              getSecretStorageKey: async ({ keys }) => {
                if (!credentials.recoveryKey) {
                  throw new Error('No recovery key provided by auth endpoint.')
                }

                try {
                  const keyBytes = decodeRecoveryKey(credentials.recoveryKey)
                  const keyId = Object.keys(keys)[0]
                  return [keyId, keyBytes]
                } catch (err) {
                  console.error('Invalid recovery key', err)
                  throw err
                }
              },
            },
          })

          await store.startup()
          await client.initRustCrypto()
          await client.startClient({ initialSyncLimit: 10 })

          const onSync = async (state: string) => {
            if (state === 'PREPARED') {
              isReady.value = true
              console.log('Matrix Client synced securely. Account data is now available.')
              client.removeListener(ClientEvent.Sync, onSync)

              const crypto = client.getCrypto()
              if (crypto) {
                const check = await crypto.checkKeyBackupAndEnable()
                if (check === null) {
                  console.warn('No key backup found on the server.')
                } else {
                  console.log(`Using existing backup version ${check.backupInfo.version}`)
                  try {
                    console.log('Triggering Secret Storage unlock...')
                    await crypto.bootstrapCrossSigning({ setupNewCrossSigning: false })
                    await crypto.loadSessionBackupPrivateKeyFromSecretStorage()
                    console.log('Secret Storage unlocked. Downloading historical keys...')

                    const result = await crypto.restoreKeyBackup({
                      progressCallback: () => {},
                    })
                    console.log('Historical messages successfully restored!', result)
                  } catch (e) {
                    console.error('Failed to unlock Secret Storage or restore backup:', e)
                  }
                }
              }
            }
          }
          client.on(ClientEvent.Sync, onSync)

          matrixClient.value = client
          return client
        } catch (error: unknown) {
          console.error('Failed to initialize Matrix client:', error)
          if (error instanceof Error && error.message.includes("doesn't match the account")) {
            console.warn('Matrix: Store mismatch detected. Wiping corrupt databases and retrying...')
            await clearMatrixStores()
            // window.location.reload()
          }
          initPromise = null
          throw error
        }
      })()
    }
    return initPromise
  }

  return { client: matrixClient, isReady, initClient }
}
