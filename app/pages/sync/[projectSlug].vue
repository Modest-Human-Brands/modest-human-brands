<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: streamCollection, refresh } = await useFetch<ProjectStreamCollection>(`/api/stream/${slug}`)

const cover = computed(() => (streamCollection.value?.poster ? extractCdnId(streamCollection.value.poster) : ''))

const videoPlayer = useTemplateRef<{ videoRef: Ref<HTMLVideoElement>; seekToLive: () => void }>('videoPlayer')

const activeDeviceId = ref(streamCollection.value?.streams[0]?.deviceId ?? 'front-camera')

const activeStream = computed(() => streamCollection.value?.streams.find((s) => s.deviceId === activeDeviceId.value))
const inactiveStreams = computed(() => streamCollection.value?.streams.filter((s) => s.deviceId !== activeDeviceId.value) ?? [])

const overallStatus = computed(() => {
  const streams = streamCollection.value?.streams ?? []
  if (streams.some((s) => s.status === StreamStatus.Live)) return StreamStatus.Live
  if (streams.some((s) => s.status === StreamStatus.Starting)) return StreamStatus.Starting
  return streams[0]?.status ?? StreamStatus.Idle
})

async function startStream(deviceId: string) {
  const stream = streamCollection.value?.streams.find((s) => s.deviceId === deviceId)
  if (stream) stream.status = StreamStatus.Starting
  activeDeviceId.value = deviceId
  await $fetch(`/api/stream/${slug}`, { method: 'POST', body: { deviceId } })
  await refresh()
}

const LIVE_THRESHOLD = 8
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

const availableDeviceIds = ['front-camera', 'back-camera']

const nextDeviceId = computed(() => availableDeviceIds.find((id) => !streamCollection.value?.streams.some((s) => s.deviceId === id)))
</script>

<template>
  <div class="flex size-full gap-2 overflow-hidden">
    <!-- Main video panel -->
    <div class="relative flex flex-1 flex-col overflow-hidden bg-black">
      <!-- STARTING state -->
      <template v-if="overallStatus === StreamStatus.Starting">
        <div class="flex size-full flex-col items-center justify-center gap-4">
          <div class="size-8 animate-spin rounded-full" />
          <p class="text-neutral-400 text-sm">Stream is starting...</p>
        </div>
      </template>
      <!-- LIVE state -->
      <template v-else-if="overallStatus === StreamStatus.Live">
        <NuxtVideo
          ref="videoPlayer"
          :poster="cover"
          :media="activeStream!.media"
          :live="true"
          :disable-picture-in-picture="true"
          :controls="false"
          :autoplay="true"
          :muted="true"
          :playsinline="true"
          preload="metadata"
          class="size-full object-cover"
          @progress="onProgress" />
        <!-- Title overlay -->
        <div class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div class="flex w-full items-center justify-between gap-3">
            <!-- <img v-if="cover" :src="cover" class="size-8 rounded-full object-cover ring-1 ring-white/20" /> -->
            <span class="font-medium text-sm capitalize text-white/90">{{ streamCollection?.title }}</span>
            <button class="flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm transition" :class="[isAtLive ? 'bg-alert-500' : 'bg-dark-500']" @click="goLive">
              <span class="relative flex size-2">
                <span class="absolute inline-flex size-full animate-ping rounded-full opacity-75" :class="[isAtLive ? 'bg-white' : 'bg-alert-400']" />
                <span class="relative inline-flex size-2 rounded-full" :class="[isAtLive ? 'bg-white' : 'bg-alert-500']" />
              </span>
              <span class="font-semibold text-xs uppercase tracking-wider text-white">Live</span>
            </button>
          </div>
        </div>
        <!-- Bottom controls bar -->
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10">
          <div class="flex items-center gap-1">
            <div class="flex items-center rounded-full bg-white/10 backdrop-blur-sm">
              <button class="flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10">
                <NuxtIcon name="local:microphone" class="text-[18px]" />
              </button>
              <div class="h-4 w-px bg-white/20" />
              <button class="flex items-center justify-center rounded-full p-2 text-white/60 transition hover:bg-white/20 hover:text-white">
                <NuxtIcon name="local:chevron-bold" class="-rotate-90 text-[12px]" />
              </button>
            </div>
            <div class="flex items-center rounded-full bg-white/10 backdrop-blur-sm">
              <button class="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10">
                <NuxtIcon name="local:camera" class="text-[18px]" />
              </button>
              <div class="h-4 w-px bg-white/20" />
              <button class="flex items-center justify-center rounded-full p-2 text-white/60 transition hover:bg-white/20 hover:text-white">
                <NuxtIcon name="local:chevron-bold" class="-rotate-90 text-[12px]" />
              </button>
            </div>
          </div>
          <button class="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition hover:bg-white/10 hover:text-white">
            <NuxtIcon name="local:cross" class="text-[16px]" />
          </button>
        </div>
      </template>
      <!-- IDLE state -->
      <template v-else>
        <div class="absolute inset-0">
          <img v-if="cover" :src="cover" class="size-full object-cover opacity-20 blur-sm" />
          <div class="absolute inset-0 bg-black/60" />
        </div>
        <div class="relative flex size-full flex-col items-center justify-center gap-6">
          <div class="text-center">
            <p class="font-medium text-lg text-white">{{ streamCollection?.title }}</p>
            <p class="text-neutral-500 mt-1 text-sm">No active stream</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="activeStream?.deviceId"
              :key="activeStream.deviceId"
              type="button"
              class="font-medium inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-black transition hover:bg-white/90"
              @click="startStream(activeStream.deviceId)">
              <span class="relative inline-flex size-2 rounded-full bg-alert-500" />
              Start {{ activeStream.deviceId.replace('-', ' ') }}
            </button>
          </div>
        </div>
      </template>
    </div>
    <!-- Right panel: always visible on md+ -->
    <div class="hidden w-60 flex-shrink-0 flex-col overflow-hidden md:flex xl:w-72">
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-px">
          <!-- Inactive streams -->
          <template v-if="inactiveStreams.length">
            <div v-for="{ deviceId, status, media } in inactiveStreams" :key="deviceId" class="group cursor-pointer transition" @click="activeDeviceId = deviceId">
              <div class="relative aspect-video w-full overflow-hidden bg-dark-500">
                <NuxtVideo
                  v-if="status === StreamStatus.Live"
                  :media="media"
                  :live="true"
                  :disable-picture-in-picture="true"
                  :controls="false"
                  :autoplay="true"
                  :muted="true"
                  :playsinline="true"
                  preload="metadata"
                  class="size-full object-cover opacity-80 transition group-hover:opacity-100" />
                <img v-else-if="cover" :src="cover" class="size-full object-cover opacity-30" />
                <div v-else class="size-full bg-dark-500" />
                <div class="absolute left-2 top-2">
                  <span class="font-medium rounded-full px-1.5 py-0.5 text-[10px] backdrop-blur-sm" :class="status === StreamStatus.Live ? 'bg-alert-500/80 text-white' : 'bg-black/60 text-white/50'">
                    {{ status === StreamStatus.Live ? 'Live' : 'Offline' }}
                  </span>
                </div>
              </div>
              <div class="px-3 py-2">
                <p class="font-medium text-xs text-white/60 transition group-hover:text-white/90">
                  {{ deviceId.replace('-', ' ') }}
                </p>
              </div>
            </div>
          </template>
          <!-- Add stream placeholder (always shown at bottom) -->
          <button type="button" class="group flex w-full cursor-pointer flex-col transition hover:bg-white/5" @click="startStream(nextDeviceId!)">
            <div class="relative aspect-video w-full overflow-hidden bg-dark-500">
              <div class="flex size-full flex-col items-center justify-center gap-2">
                <div class="flex size-8 items-center justify-center rounded-full border border-dashed border-white/20 text-white/30 transition group-hover:border-white/40 group-hover:text-white/50">
                  <NuxtIcon name="local:plus" class="text-[14px]" />
                </div>
              </div>
            </div>
            <div class="px-3 py-2">
              <p class="font-medium text-xs text-white/30 transition group-hover:text-white/50">Add camera</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
