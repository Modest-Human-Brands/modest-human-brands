<script setup lang="ts">
definePageMeta({ layout: false })

const {
  public: { livekitUrl, llhlsUrl },
} = useRuntimeConfig()

const route = useRoute()
const orgSlug = route.params.orgSlug!.toString()
const projectSlug = route.params.projectSlug!.toString()

const { data: organizationData } = await useFetch(`/api/organization/${orgSlug}`)

const organization = computed(() => organizationData.value ?? DEFAULT_ORG)

const { data: streamCollection, refresh } = await useFetch<ProjectStreamCollection>(`/api/stream/${projectSlug}`)
const { resume } = useIntervalFn(refresh, 5000, { immediate: false })

const activeDeviceId = ref(streamCollection.value?.streams[0]?.deviceId)
const activeStream = computed(() => streamCollection.value?.streams.find((s) => s.deviceId === activeDeviceId.value))
const inactiveStreams = computed(() => streamCollection.value?.streams.filter((s) => s.deviceId !== activeDeviceId.value) ?? [])

const activeVideoInputId = shallowRef<string>()
const activeAudioInputId = shallowRef<string>()

const { isConnecting, isConnected, viewerCount, isHostPresent, startViewing, stopViewing } = useLiveKit()

const videoEl = ref<HTMLVideoElement | null>(null)

onMounted(async () => {
  resume()

  if (!videoEl.value) return
  try {
    const { streams } = await $fetch(`/api/stream/${projectSlug}`, {
      method: 'POST',
      body: { deviceId: projectSlug },
    })

    if (streams && streams.length > 0) {
      await startViewing(livekitUrl, streams[0].token, videoEl.value)
    } else {
      console.warn('No active streams found for this project.')
    }
  } catch (error) {
    console.error('Failed to start viewing:', error)
    // await navigateTo('/')
  }
})

onUnmounted(() => {
  stopViewing()
})

function updateActiveInput(type: 'video' | 'audio', id: string) {
  if (type === 'video') activeVideoInputId.value = id
  else activeAudioInputId.value = id
}

const isAtLive = ref(false)
const streamStartedAt = ref<Date | null>(null)
const now = useNow({ interval: 1000 })

const streamDuration = computed(() => {
  const startTime = activeStream.value?.createdAt ? new Date(activeStream.value.createdAt) : null

  if (!startTime) return null
  if (streamCollection.value?.status !== StreamStatus.Live) return null

  const elapsed = Math.floor((now.value.getTime() - startTime.getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(s).padStart(2, '0')].filter(Boolean).join(':')
})
</script>

<template>
  <CardOrganization :organization="organization" class="absolute right-4 top-16 z-20 md:right-1/2 md:top-4 md:translate-x-1/2" />
  <div class="flex h-screen w-screen flex-col gap-2 overflow-hidden p-2 md:flex-row">
    <div class="relative flex grow flex-col overflow-hidden bg-black">
      <video ref="videoEl" autoplay playsinline :controls="false" class="size-full rounded-md object-contain" />

      <div v-if="!isConnected" class="absolute inset-0 flex items-center justify-center bg-black/60">
        <div class="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>

      <div v-if="isConnected && !isHostPresent" class="absolute inset-0 flex items-center justify-center">
        <p class="text-sm text-white/50">Stream has ended</p>
      </div>

      <div v-if="isConnected && isHostPresent" class="absolute left-4 top-4 flex items-center gap-2">
        <span class="bg-red-500 rounded-full px-2 py-1 text-xs font-semi-bold uppercase text-white"> Live </span>
        <span class="rounded-full bg-black/60 px-2 py-1 text-xs text-white/70"> {{ viewerCount }} watching </span>
      </div>
    </div>

    <div
      v-if="inactiveStreams.length"
      class="scrollbar-hidden flex h-40 flex-shrink-0 flex-row overflow-x-auto overflow-y-hidden border-white/5 md:h-auto md:w-60 md:flex-col md:overflow-y-auto md:overflow-x-hidden xl:w-72">
      <div class="flex flex-row gap-px md:flex-col">
        <div
          v-for="{ deviceId, status, media, poster } in inactiveStreams"
          :key="deviceId"
          class="group relative w-56 flex-shrink-0 cursor-pointer transition hover:bg-white/5 md:w-auto"
          @click="activeDeviceId = deviceId">
          <div class="relative aspect-video overflow-hidden bg-dark-500">
            <NuxtVideo
              v-if="status === StreamStatus.Live && media"
              :base-url="llhlsUrl"
              :poster="poster"
              :media="media"
              :live="true"
              :controls="false"
              :autoplay="true"
              :playsinline="true"
              class="size-full object-cover opacity-80 transition group-hover:opacity-100" />
            <NuxtImg v-else-if="poster" :src="poster" class="size-full object-cover opacity-30" />
            <div v-else class="size-full bg-dark-500" />
            <LiveChip class="absolute right-2 top-2 scale-75" :status="status" />
          </div>
          <div class="px-3 py-2">
            <p class="font-medium truncate text-sm lowercase text-white/80 transition first-letter:uppercase group-hover:text-white">
              {{ deviceId.replaceAll('-', ' ') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
