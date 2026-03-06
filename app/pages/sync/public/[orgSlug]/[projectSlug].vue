<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: streamCollection } = await useFetch<ProjectStreamCollection>(`/api/stream/${slug}`)

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
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-black">
    <!-- Main video panel -->
    <div class="relative flex flex-1 flex-col overflow-hidden">
      <!-- STARTING -->
      <template v-if="overallStatus === StreamStatus.Starting">
        <div class="flex size-full flex-col items-center justify-center gap-4">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p class="text-neutral-400 text-sm">Stream is starting...</p>
        </div>
      </template>

      <!-- LIVE -->
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

        <div class="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div class="flex items-center gap-3">
            <!-- <img v-if="cover" :src="cover" class="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" /> -->
            <span class="font-medium text-sm text-white/90">{{ streamCollection?.title }}</span>
          </div>
        </div>

        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10">
          <button class="flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm transition" :class="[isAtLive ? 'bg-alert-500' : 'bg-dark-500']" @click="goLive">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" :class="[isAtLive ? 'bg-white' : 'bg-alert-400']" />
              <span class="relative inline-flex h-2 w-2 rounded-full" :class="[isAtLive ? 'bg-white' : 'bg-alert-500']" />
            </span>
            <span class="font-semibold text-xs uppercase tracking-wider text-white">Live</span>
          </button>
        </div>
      </template>

      <!-- IDLE -->
      <template v-else>
        <div class="absolute inset-0">
          <img v-if="cover" :src="cover" class="size-full object-cover opacity-20 blur-sm" />
          <div class="absolute inset-0 bg-black/60" />
        </div>
        <div class="relative flex size-full flex-col items-center justify-center gap-3">
          <p class="font-medium text-base text-white">{{ streamCollection?.title }}</p>
          <p class="text-neutral-500 text-sm">Stream not started yet, please wait...</p>
        </div>
      </template>
    </div>

    <!-- Right panel: only when there are inactive streams -->
    <div v-if="inactiveStreams.length" class="hidden w-60 flex-shrink-0 flex-col overflow-hidden border-l border-white/5 bg-dark-600 md:flex xl:w-72">
      <p class="font-medium px-3 pb-2 pt-3 text-xs uppercase tracking-wider text-white/30">Cameras</p>
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-px">
          <div v-for="{ deviceId, status, media } in inactiveStreams" :key="deviceId" class="group cursor-pointer transition hover:bg-white/5" @click="activeDeviceId = deviceId">
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
        </div>
      </div>
    </div>
  </div>
</template>
