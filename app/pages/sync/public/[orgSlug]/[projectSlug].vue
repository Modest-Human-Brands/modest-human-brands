<script setup lang="ts">
definePageMeta({ layout: false })

const {
  public: { llhlsUrl },
} = useRuntimeConfig()

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: organizationData } = await useFetch(`/api/organization/${slug}`)

const DEFAULT_ORG = {
  name: 'Modest Human Brands',
  website: 'https://modesthumanbrands.com',
  branding: {
    logo: 'https://modesthumanbrands.com/logo.svg',
    color: { primary: '#4A85FF', accent: '' },
    font: '',
  },
  phone: '+912269711501',
  whatsapp: 'https://wa.me/912269711501',
}
const organization = computed(() => organizationData.value ?? (DEFAULT_ORG as Organization))

const { data: streamCollection } = await useFetch<ProjectStreamCollection>(`/api/stream/${slug}`)

const videoPlayer = useTemplateRef<{ videoRef: Ref<HTMLVideoElement>; seekToLive: () => void }>('videoPlayer')

const activeDeviceId = ref(streamCollection.value?.streams[0]?.deviceId)

const activeStream = computed(() => streamCollection.value?.streams.find((s) => s.deviceId === activeDeviceId.value))
const inactiveStreams = computed(() => streamCollection.value?.streams.filter((s) => s.deviceId !== activeDeviceId.value) ?? [])

const LIVE_THRESHOLD = 5
const currentTime = ref(0)
const duration = ref(0)

const isAtLive = computed(() => {
  if (!isFinite(duration.value) || duration.value === 0) return true
  return duration.value - currentTime.value <= LIVE_THRESHOLD
})

function onProgress() {
  const video = videoPlayer.value?.videoRef.value
  if (!video) return
  currentTime.value = video.currentTime
  duration.value = video.duration
}

function goLive() {
  videoPlayer.value?.seekToLive()
}

const now = useNow({ interval: 1000 })

const streamDuration = computed(() => {
  const createdAt = activeStream.value?.createdAt
  if (!createdAt || streamCollection.value?.status !== StreamStatus.Live) return null
  const elapsed = Math.floor((now.value.getTime() - new Date(createdAt).getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(s).padStart(2, '0')].filter(Boolean).join(':')
})
</script>

<template>
  <!-- Organization -->
  <CardOrganization :organization="organization" class="absolute right-4 top-16 z-20 md:right-1/2 md:top-4 md:translate-x-1/2" />
  <!-- Header -->
  <div class="flex h-screen w-screen flex-col gap-2 overflow-hidden md:flex-row">
    <div class="relative flex flex-1 flex-col overflow-hidden bg-black">
      <template v-if="streamCollection?.status === StreamStatus.Starting">
        <div class="flex size-full flex-col items-center justify-center gap-4 bg-cover" :style="{ 'background-image': `url(${streamCollection?.poster})` }">
          <div class="size-8 animate-spin rounded-full" />
          <p class="text-neutral-400 text-sm">Stream is starting...</p>
        </div>
      </template>
      <template v-else-if="streamCollection?.status === StreamStatus.Live && activeStream">
        <NuxtVideo
          ref="videoPlayer"
          :base-url="llhlsUrl"
          :poster="activeStream.poster"
          :media="activeStream.media"
          :live="true"
          :disable-picture-in-picture="true"
          :controls="false"
          :autoplay="true"
          :muted="true"
          :playsinline="true"
          preload="metadata"
          class="size-full rounded-md object-cover"
          @progress="onProgress" />
        <div class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div class="absolute left-0 top-0 flex w-full items-center justify-between gap-3 bg-gradient-to-b from-black/60 to-transparent p-4 pb-8">
            <div class="flex flex-col gap-1">
              <span class="font-medium text-lg capitalize text-white">{{ streamCollection?.title }}</span>
              <span class="text-base lowercase first-letter:uppercase">
                {{ activeStream?.deviceId?.replace('-', ' ') }}
              </span>
            </div>
            <div class="pointer-events-auto flex items-center gap-2">
              <span v-if="streamDuration" class="font-mono rounded-full bg-black px-2 py-1 text-xs tabular-nums text-white">
                {{ streamDuration }}
              </span>
              <button @click="goLive">
                <LiveChip :status="isAtLive ? StreamStatus.Live : StreamStatus.Idle" />
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="relative flex size-full flex-col items-center justify-center gap-6 bg-cover" :style="{ 'background-image': `url(${streamCollection?.poster})` }">
          <div class="text-center">
            <span class="font-medium text-lg capitalize text-white">{{ streamCollection?.title }}</span>
            <p class="mt-1 text-sm text-white/40">Stream not started yet, please wait...</p>
          </div>
        </div>
      </template>
    </div>
    <div
      v-if="inactiveStreams.length"
      class="scrollbar-hidden flex h-40 flex-shrink-0 flex-row overflow-x-auto overflow-y-hidden md:h-auto md:w-60 md:flex-col md:overflow-y-auto md:overflow-x-hidden xl:w-72">
      <div class="flex flex-row gap-2 md:flex-col">
        <div
          v-for="{ deviceId, status, media, poster } in inactiveStreams"
          :key="deviceId"
          class="group relative flex-shrink-0 cursor-pointer transition hover:bg-white/5 md:w-auto"
          @click="activeDeviceId = deviceId">
          <div class="relative aspect-video h-full overflow-hidden bg-dark-500">
            <NuxtVideo
              v-if="status === StreamStatus.Live"
              :base-url="llhlsUrl"
              :poster="poster"
              :media="media"
              :live="true"
              :disable-picture-in-picture="true"
              :controls="false"
              :autoplay="true"
              :muted="true"
              :playsinline="true"
              preload="metadata"
              class="size-full rounded-md object-cover opacity-80 transition group-hover:opacity-100" />
            <img v-else-if="poster" :src="poster" class="size-full object-cover opacity-30" />
            <div v-else class="size-full bg-dark-500" />

            <LiveChip class="absolute right-2 top-2" :status="status" />
          </div>
          <div class="absolute left-0 top-0 px-3 py-2">
            <p class="font-medium text-base lowercase text-white transition first-letter:uppercase">
              {{ deviceId.replace('-', ' ') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
