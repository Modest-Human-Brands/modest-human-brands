<script setup lang="ts">
import FingerprintJS from '@fingerprintjs/fingerprintjs'

const title = `Modest Human Brands`
const description = `Autonomous Next-Gen Media Operating System`

const {
  app: { buildTime },
  public: { siteUrl, vapidKey },
} = useRuntimeConfig()

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
  ],
})

useSeoMeta({
  ogType: 'profile',
  ogImageWidth: 1280,
  ogImageHeight: 640,
  fbAppId: 966242223397117,
  twitterCard: 'summary_large_image',
  colorScheme: 'light dark',
  viewport: {
    initialScale: 1.0,
    maximumScale: 1.0,
    minimumScale: 1.0,
    userScalable: 'no',
    viewportFit: 'cover',
  },
})

useSchemaOrg([
  defineWebPage({
    datePublished: new Date(2026, 1, 1).toISOString(),
    dateModified: buildTime,
    author: 'Shirsendu Bairagi',
  }),
  defineWebSite({
    url: siteUrl,
    name: title,
    description: description,
  }),
])

const { $api } = useNuxtApp()
const { loggedIn, session } = useUserSession()
const { isSupported, permissionGranted } = useWebNotification()

async function syncVisitorFingerprint() {
  if (!loggedIn.value || session.value?.deviceId) return

  try {
    const fp = await FingerprintJS.load()
    const { visitorId } = await fp.get()

    await $api('/auth/device', {
      method: 'PATCH',
      body: { deviceId: visitorId },
    })
  } catch (error) {
    console.warn('[Fingerprint] Failed to attach visitor ID:', error)
  }
}

async function getExistingSubscription() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser.')
    return
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()

    if (!registration) {
      console.warn('No Service Worker is registered. Push notifications aborted.')
      return
    }

    const activeRegistration = await navigator.serviceWorker.ready

    let subscription = await activeRegistration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await activeRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })
    }

    await $api('/api/notification/push/subscribe', {
      method: 'POST',
      body: subscription.toJSON(),
    })

    return subscription
  } catch (error) {
    console.warn('Push subscription failed or was denied:', error)
  }
}

onMounted(async () => {
  syncVisitorFingerprint()
  if (isSupported.value && permissionGranted.value) await getExistingSubscription()
})

watch(loggedIn, (isLoggedIn) => {
  if (isLoggedIn) syncVisitorFingerprint()
})

watch(permissionGranted, async (value) => {
  if (value) await getExistingSubscription()
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPwaAssets />
  <NuxtLoadingIndicator color="#0593FA" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <LazyAppInstallPrompt hydrate-on-idle />
</template>

<style>
* {
  -webkit-tap-highlight-color: transparent;
  scrollbar-width: 6px;
  @apply antialiased;
}

*::-webkit-scrollbar {
  @apply block size-[6px] bg-light-400 dark:bg-dark-400;
}

*::-webkit-scrollbar-thumb {
  @apply rounded-none bg-dark-600 dark:bg-light-600;
}

html {
  @apply relative overflow-x-hidden scroll-smooth;
}

body {
  @apply relative min-h-screen overflow-x-hidden bg-light-400 fill-black font-main text-black dark:bg-dark-400 dark:fill-white dark:text-white;
}

svg.iconify--local {
  @apply !m-0 !box-content;
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
