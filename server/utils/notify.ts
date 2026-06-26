import webpush from 'web-push'
import type { H3Event } from 'h3'

export type MDocEvent = 'DOCUMENT_CREATED' | 'DOCUMENT_VIEWED' | 'DOCUMENT_SIGNED' | 'DOCUMENT_COMPLETED'

interface PushNotification {
  title: string
  body: string
  url: string
  icon?: string
}

export interface PushNotificationSubscription {
  endpoint: string
  expirationTime: null | number
  keys: {
    p256dh: string
    auth: string
  }
  organizationId?: string
  organizations?: string[]
}

export async function sendPushNotification(payload: PushNotification, subscriptions: PushNotificationSubscription[]) {
  try {
    const config = useRuntimeConfig()

    if (!config.private.vapidSubject || !config.public.vapidKey || !config.private.vapidKey) {
      console.warn('[Notifier] VAPID details are missing from environment variables. Skipping Web Push.')
      return false
    }

    webpush.setVapidDetails(config.private.vapidSubject, config.public.vapidKey, config.private.vapidKey)

    await Promise.allSettled(subscriptions.map((sub) => webpush.sendNotification(sub, JSON.stringify(payload))))

    return true
  } catch (error) {
    console.error('[Notifier] Error sending push notification:', error)
    return false
  }
}

function formatPushPayload(eventType: MDocEvent, payload: Record<string, string>): PushNotification {
  const docName = payload.documentName || payload.fileName || 'A document'
  switch (eventType) {
    case 'DOCUMENT_CREATED':
      return { title: 'New Document Generated', body: `${docName} has been created and is ready.`, url: '/doc' }
    case 'DOCUMENT_SIGNED':
      return { title: 'Document Signed', body: `${payload.signerName || 'Someone'} just signed ${docName}.`, url: '/doc' }
    case 'DOCUMENT_COMPLETED':
      return { title: 'Document Completed', body: `${docName} is fully executed and sealed.`, url: '/doc' }
    case 'DOCUMENT_VIEWED':
      return { title: 'Document Viewed', body: `${docName} was opened.`, url: '/doc' }
    default:
      return { title: 'System Alert', body: 'A document event occurred.', url: '/doc' }
  }
}

export default function (event: H3Event, eventType: MDocEvent, payload: Record<string, string>, orgId?: string) {
  const backgroundTask = async () => {
    try {
      const targetOrgId = orgId

      if (!targetOrgId) {
        console.warn(`[Notifier] Event ${eventType} is missing an organization ID. Notification aborted to maintain strict isolation.`)
        return
      }

      const notificationStorage = useStorage<PushNotificationSubscription[]>('data:subscription:notification')
      const keys = await notificationStorage.getKeys()

      if (keys.length === 0) return

      const items = await notificationStorage.getItems(keys)
      let subscriptions = items.flatMap(({ value }) => value || []) as PushNotificationSubscription[]

      subscriptions = subscriptions.filter((sub) => {
        if (sub.organizationId === targetOrgId) return true
        if (sub.organizations && sub.organizations.includes(targetOrgId)) return true
        return false
      })

      if (payload.targetAuthId) {
        subscriptions = subscriptions.filter((sub) => sub.keys?.auth === payload.targetAuthId)
      }

      if (subscriptions.length > 0) {
        const pushData = formatPushPayload(eventType, payload)
        await sendPushNotification(pushData, subscriptions)
      }
    } catch (error) {
      console.error(`❌ [Push Notification Failed] ${eventType}:`, error)
    }
  }

  event.waitUntil(backgroundTask())
}
