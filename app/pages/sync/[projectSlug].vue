<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  // middleware: ['auth'],
})

const {
  public: { whipUrl, llhlsUrl },
} = useRuntimeConfig()

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: streamCollection } = await useFetch<ProjectStreamCollection>(`/api/stream/${slug}`)

const activeDeviceId = ref(streamCollection.value?.streams[0]?.deviceId)

const activeStream = computed(() => streamCollection.value?.streams.find((s) => s.deviceId === activeDeviceId.value))
const inactiveStreams = computed(() => streamCollection.value?.streams.filter((s) => s.deviceId !== activeDeviceId.value) ?? [])

const activeVideoInputId = shallowRef<string>()
const activeAudioInputId = shallowRef<string>()
const { videoInputs, audioInputs, ensurePermissions } = useDevicesList({
  onUpdated() {
    if (!videoInputs.value.find((i) => i.deviceId === activeVideoInputId.value)) activeVideoInputId.value = videoInputs.value[0]?.deviceId

    if (!audioInputs.value.find((i) => i.deviceId === activeAudioInputId.value)) activeAudioInputId.value = audioInputs.value[0]?.deviceId
  },
})

onMounted(() => {
  activeVideoInputId.value = videoInputs.value[0]?.deviceId
  activeAudioInputId.value = audioInputs.value[0]?.deviceId
})

const videoPlayer = useTemplateRef<{ videoRef: HTMLVideoElement | null; seekToLive: () => object }>('videoPlayer')
const { stream, enabled: isStreaming } = useUserMedia({
  constraints: computed(() => ({
    video: {
      deviceId: activeVideoInputId.value ? { exact: activeVideoInputId.value } : undefined,
      width: { ideal: 1920 },
      height: { ideal: 1920 },
      frameRate: { ideal: 30, min: 30 },
    },
    audio: {
      deviceId: activeAudioInputId.value ? { exact: activeAudioInputId.value } : undefined,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: { ideal: 48000 },
      sampleSize: { ideal: 16 },
      channelCount: { ideal: 2 },
    },
  })),
})

const { start, stop } = useWhip({
  baseUrl: whipUrl,
})

watchEffect(async () => {
  if (videoPlayer.value?.videoRef && stream.value) {
    videoPlayer.value.videoRef.srcObject = stream.value
    if (isStreaming.value) await start(stream.value!, `${slug}_${activeDeviceId.value}`)
  }
})

function updateActiveInput(type: 'video' | 'audio', id: string) {
  if (type === 'video') activeVideoInputId.value = id
  else if (type === 'audio') activeAudioInputId.value = id
}

const showDeviceModal = ref(false)

async function createStream() {
  await ensurePermissions()
  showDeviceModal.value = true
}

function startStreaming(deviceId: string) {
  isStreaming.value = true
  activeDeviceId.value = deviceId
}

async function stopStreaming() {
  await stop()
  isStreaming.value = false
}

const isAtLive = ref(false)

const streamStartedAt = ref<Date | null>(null)
watch(isStreaming, (streaming) => {
  streamStartedAt.value = streaming ? new Date() : null
})

const now = useNow({ interval: 1000 })

const streamDuration = computed(() => {
  const startTime = isStreaming.value ? streamStartedAt.value : activeStream.value?.createdAt ? new Date(activeStream.value.createdAt) : null

  if (!startTime) return null
  if (!isStreaming.value && streamCollection.value?.status !== StreamStatus.Live) return null

  const elapsed = Math.floor((now.value.getTime() - startTime.getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(s).padStart(2, '0')].filter(Boolean).join(':')
})

function goLive() {}
</script>

<template>
  <div class="flex size-full flex-col gap-2 overflow-hidden md:flex-row">
    <div class="relative flex flex-1 flex-col overflow-hidden bg-black">
      <template v-if="isStreaming || streamCollection?.status === StreamStatus.Live">
        <NuxtVideo
          ref="videoPlayer"
          :poster="activeStream?.poster"
          v-bind="!isStreaming && activeStream?.media ? { baseUrl: llhlsUrl, media: activeStream.media } : {}"
          :live="true"
          :disable-picture-in-picture="true"
          :controls="false"
          :autoplay="true"
          :muted="true"
          :playsinline="true"
          preload="metadata"
          class="size-full rounded-md object-contain" />

        <div class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div class="absolute left-0 top-0 flex w-full items-center justify-between gap-3 bg-gradient-to-b from-black/60 to-transparent p-4 pb-8">
            <div class="flex flex-col gap-1">
              <span class="font-medium text-lg capitalize text-white">{{ streamCollection?.title }}</span>
              <span class="text-base lowercase first-letter:uppercase">
                {{ activeStream?.deviceId?.replaceAll('-', ' ') }}
              </span>
            </div>
            <div class="pointer-events-auto flex items-center gap-2">
              <span v-if="streamDuration" class="font-mono rounded-full bg-black px-2 py-1 text-xs tabular-nums text-white">
                {{ streamDuration }}
              </span>
              <span v-if="isStreaming && !isStreaming" class="rounded-full bg-warning-500/20 px-2 py-1 text-xs text-warning-400"> Connecting… </span>
              <button @click="goLive">
                <LiveChip :status="isAtLive ? StreamStatus.Live : StreamStatus.Idle" />
              </button>
            </div>
          </div>
        </div>
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
          <button class="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition hover:bg-alert-500/80 hover:text-white" @click="stopStreaming()">
            <NuxtIcon name="local:cross" class="text-[16px]" />
          </button>
        </div>
      </template>

      <template v-else-if="!isStreaming && streamCollection?.status === StreamStatus.Starting">
        <div class="flex size-full flex-col items-center justify-center gap-4 bg-cover" :style="{ 'background-image': `url(${streamCollection?.poster})` }">
          <div class="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p class="text-neutral-400 text-sm">Requesting camera access…</p>
          <!-- <p v-if="errorStreaming" class="text-xs text-alert-500">{{ errorStreaming.message }}</p> -->
        </div>
      </template>

      <template v-else-if="streamCollection?.status === StreamStatus.Starting">
        <div class="flex size-full flex-col items-center justify-center gap-4 bg-cover" :style="{ 'background-image': `url(${streamCollection?.poster})` }">
          <div class="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p class="text-neutral-400 text-sm">Stream is starting…</p>
        </div>
      </template>

      <template v-else>
        <div class="relative flex size-full flex-col items-center justify-center gap-6 bg-cover" :style="{ 'background-image': `url(${streamCollection?.poster})` }">
          <div class="text-center">
            <span class="font-medium text-lg capitalize text-white">{{ streamCollection?.title }}</span>
            <p class="mt-1 text-sm text-white/40">Ready to broadcast</p>
          </div>
          <button type="button" class="font-medium inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-black transition hover:bg-white/90" @click="createStream">
            <span class="relative inline-flex size-2 rounded-full bg-alert-500" />
            Start Stream
          </button>
        </div>
      </template>
    </div>

    <div class="scrollbar-hidden flex h-40 flex-shrink-0 flex-row overflow-x-auto overflow-y-hidden md:h-auto md:w-60 md:flex-col md:overflow-y-auto md:overflow-x-hidden xl:w-72">
      <div class="flex flex-row gap-2 md:flex-col">
        <template v-if="inactiveStreams.length">
          <div
            v-for="{ deviceId, status, media, poster } in inactiveStreams"
            :key="deviceId"
            class="group relative flex-shrink-0 cursor-pointer transition hover:bg-white/5 md:w-auto"
            :style="{ 'background-image': streamCollection?.poster }"
            @click="activeDeviceId = deviceId">
            <div class="relative aspect-video h-full overflow-hidden bg-dark-500">
              <NuxtVideo
                v-if="status === StreamStatus.Live && media"
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
                {{ deviceId.replaceAll('-', ' ') }}
              </p>
            </div>
          </div>
        </template>
        <button type="button" class="group flex w-56 flex-shrink-0 cursor-pointer flex-col transition hover:bg-white/5 md:w-auto" @click="createStream">
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

    <ModalDeviceSelect
      v-if="showDeviceModal"
      :is-open="showDeviceModal"
      :video-inputs="videoInputs"
      :audio-inputs="audioInputs"
      :active-video-input-id="activeVideoInputId"
      :active-audio-input-id="activeAudioInputId"
      @update="updateActiveInput"
      @close="showDeviceModal = false"
      @create="startStreaming" />
  </div>
</template>
