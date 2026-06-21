import * as sdk from 'matrix-js-sdk'
import { ClientEvent } from 'matrix-js-sdk'
import { decodeRecoveryKey } from 'matrix-js-sdk/lib/crypto-api'

import { logger } from 'matrix-js-sdk/lib/logger'

logger.disableAll()

const matrixClient = ref<sdk.MatrixClient | null>(null)
const isReady = ref(false)

// --- State Tracking for UI ---
export interface SyncState {
  stateName: string
  totalStateCount: number
  completedStateCount: number
  progress: number // 0-100
}

const syncStatus = ref<SyncState>({
  stateName: 'Idle',
  totalStateCount: 6,
  completedStateCount: 0,
  progress: 0,
})

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
        syncStatus.value.completedStateCount = 1
        syncStatus.value.stateName = 'Authenticating with Synapse'
        syncStatus.value.progress = 0

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
                const userInput = window.prompt('To decrypt historical messages, enter your Security Key.\n(Leave blank to use the automatic key provided by the server):')
                const keyToUse = userInput && userInput.trim() !== '' ? userInput.trim() : credentials.recoveryKey

                if (!keyToUse) {
                  throw new Error('No recovery key provided.')
                }

                try {
                  const keyBytes = decodeRecoveryKey(keyToUse)
                  const keyId = Object.keys(keys)[0]!
                  return [keyId, keyBytes]
                } catch (err) {
                  console.error('Invalid recovery key format', err)
                  throw err
                }
              },
            },
          })

          await store.startup()
          await client.initRustCrypto()
          await client.startClient({ initialSyncLimit: 10 })

          syncStatus.value.completedStateCount = 2
          syncStatus.value.stateName = 'Fetching initial rooms and state'
          syncStatus.value.progress = 0

          const onSync = async (state: string) => {
            if (state === 'PREPARED') {
              isReady.value = true
              console.log('Matrix Client synced securely. Account data is now available.')
              client.removeListener(ClientEvent.Sync, onSync)

              const crypto = client.getCrypto()
              if (crypto) {
                try {
                  // 1. AWAIT PUBLIC KEYS (Fixes the first-load crash)
                  syncStatus.value.completedStateCount = 3
                  syncStatus.value.stateName = 'Downloading cryptographic identity'

                  // Wait for the background out-of-band /keys/query to resolve
                  await client.downloadKeys([credentials.userId])

                  // 2. PROPER CROSS-SIGNING BOOTSTRAP
                  syncStatus.value.completedStateCount = 4
                  syncStatus.value.stateName = 'Unlocking Secret Storage & Cross-Signing'

                  await crypto.bootstrapCrossSigning({ setupNewCrossSigning: false })

                  // 3. SELF-VERIFICATION
                  const currentDeviceId = client.getDeviceId()
                  if (currentDeviceId) {
                    await crypto.crossSignDevice(currentDeviceId)
                  }

                  // 4. CHECK BACKUP STATUS
                  syncStatus.value.completedStateCount = 5
                  syncStatus.value.stateName = 'Checking for server backups'

                  const backupInfo = await crypto.checkKeyBackupAndEnable()

                  // 5. RESTORE HISTORICAL KEYS
                  syncStatus.value.completedStateCount = 6
                  if (backupInfo) {
                    syncStatus.value.stateName = `Restoring backup version ${backupInfo.backupInfo.version}`
                    console.log(`Matrix: Found backup v${backupInfo.backupInfo.version}. Starting restore...`)

                    const result = await crypto.restoreKeyBackup({
                      progressCallback: (progress) => {
                        const percent = progress.total > 0 ? Math.round((progress.successes / progress.total) * 100) : 0
                        syncStatus.value.progress = percent
                      },
                    })
                    console.log('Matrix: Historical messages successfully restored!', result)

                    syncStatus.value.stateName = 'End-to-End Encryption fully synchronized'
                    syncStatus.value.progress = 100
                  } else {
                    console.warn('Matrix: No historical key backup found on the server.')
                    syncStatus.value.stateName = 'No historical backup found. Ready.'
                    syncStatus.value.progress = 100
                  }
                } catch (e) {
                  syncStatus.value.stateName = 'Encryption setup failed'
                  syncStatus.value.progress = 0
                  console.error('Matrix E2EE Setup Failed. Is the Recovery Key correct?', e)
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
          }
          initPromise = null
          syncStatus.value.stateName = 'Failed to initialize Matrix client'
          syncStatus.value.progress = 0
          throw error
        }
      })()
    }
    return initPromise
  }

  return { client: matrixClient, isReady, syncStatus, initClient }
}
