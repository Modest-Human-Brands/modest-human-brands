import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

import { NetworkFirst } from 'workbox-strategies'
import { onNotificationClick, onPush } from './sw-push'

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown[] }

const entries = self.__WB_MANIFEST

if (import.meta.env.DEV) {
  entries.push({ url: '/', revision: Math.random().toString() })
}

precacheAndRoute(entries)

cleanupOutdatedCaches()

const isLocalhost = (url: URL) => url.hostname === 'localhost' || url.hostname === '127.0.0.1'

registerRoute(
  ({ request, url }) => request.mode === 'navigate' && !isLocalhost(url),
  new NetworkFirst({
    cacheName: 'html-cache',
    networkTimeoutSeconds: 3,
  })
)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api') && !isLocalhost(url),
  new NetworkFirst({
    cacheName: 'api-cache',
  })
)

registerRoute(
  ({ request }) => ['style', 'script', 'image', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [],
  })
)

self.addEventListener('push', onPush)
self.addEventListener('notificationclick', onNotificationClick)
