<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const {
  public: { livekitUrl, llhlsUrl },
} = useRuntimeConfig()

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { loggedIn } = useUserSession()

// ─── Stream collection ────────────────────────────────────────────────────
const { data: streamCollection, refresh } = await useFetch<ProjectStreamCollection>(`/api/stream/${slug}`)
const { resume } = useIntervalFn(refresh, 5000, { immediate: false })

const activeDeviceId = ref(streamCollection.value?.streams[0]?.deviceId)
const activeStream = computed(() => streamCollection.value?.streams.find((s) => s.deviceId === activeDeviceId.value))
const inactiveStreams = computed(() => streamCollection.value?.streams.filter((s) => s.deviceId !== activeDeviceId.value) ?? [])

// ─── Device enumeration ───────────────────────────────────────────────────
const activeVideoInputId = shallowRef<string>()
const activeAudioInputId = shallowRef<string>()
const { videoInputs, audioInputs, ensurePermissions } = useDevicesList({
  requestPermissions: false,
  onUpdated() {
    if (!videoInputs.value.find((i) => i.deviceId === activeVideoInputId.value)) activeVideoInputId.value = videoInputs.value[0]?.deviceId
    if (!audioInputs.value.find((i) => i.deviceId === activeAudioInputId.value)) activeAudioInputId.value = audioInputs.value[0]?.deviceId
  },
})

// ─── Camera preview (before going live) ──────────────────────────────────
// useUserMedia holds the camera only during the brief preview window.
// It is disabled before startPublishing so LiveKit can acquire the device.
const { stream: cameraStream, enabled: isCameraEnabled } = useUserMedia({
  constraints: computed(() => ({
    video: {
      deviceId: activeVideoInputId.value ? { exact: activeVideoInputId.value } : undefined,
      width: { ideal: 2880 },
      height: { ideal: 1800 },
      frameRate: { ideal: 30 },
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

// ─── LiveKit ──────────────────────────────────────────────────────────────
const { isConnecting, isConnected, isPublishing, startPublishing, stopPublishing, viewerCount, isHostPresent, startViewing, stopViewing } = useLiveKit()

// ─── Video element ────────────────────────────────────────────────────────
// Always a native <video> — never a component ref — to keep LiveKit's
// track.attach() away from Vue reactive proxies.
const videoEl = ref<HTMLVideoElement | null>(null)

// Show camera preview as soon as useUserMedia has a stream,
// but only while we haven't handed off to LiveKit yet.
watchEffect(() => {
  if (videoEl.value && cameraStream.value && !isPublishing.value) {
    videoEl.value.srcObject = cameraStream.value
  }
})

// ─── Lifecycle ────────────────────────────────────────────────────────────
onMounted(async () => {
  resume()

  // Streamer connects via button click — nothing to do here
  if (loggedIn.value) return

  // Viewer: auto-connect on mount
  if (!videoEl.value) return
  try {
    const { streams } = await $fetch(`/api/stream/${slug}`, {
      method: 'POST',
      body: { deviceId: slug },
    })
    await startViewing(livekitUrl, streams[0].token, videoEl.value)
  } catch {
    await navigateTo('/')
  }
})

onUnmounted(() => {
  isCameraEnabled.value = false
  if (loggedIn.value) stopPublishing()
  else stopViewing()
})

// ─── Stream controls ──────────────────────────────────────────────────────
const showDeviceModal = ref(false)

async function createStream() {
  await ensurePermissions()
  showDeviceModal.value = true
}

async function startStreaming(deviceId: string) {
  activeDeviceId.value = deviceId
  // 1. Start camera preview via useUserMedia
  isCameraEnabled.value = true

  // 2. Fetch publisher token while preview is showing
  const { streams } = await $fetch(`/api/stream/${slug}`, {
    method: 'POST',
    body: { deviceId },
  })

  // 3. Release camera so LiveKit can acquire it with the same deviceId
  isCameraEnabled.value = false
  await nextTick()

  // 4. LiveKit takes over — re-acquires camera with the chosen deviceId
  await startPublishing(livekitUrl, streams[0].token, videoEl.value!, activeVideoInputId.value, activeAudioInputId.value)
}

async function stopStreaming() {
  await stopPublishing()
  // Clear srcObject so the black frame doesn't linger
  if (videoEl.value) videoEl.value.srcObject = null
}

function updateActiveInput(type: 'video' | 'audio', id: string) {
  if (type === 'video') activeVideoInputId.value = id
  else activeAudioInputId.value = id
}

// ─── Stream duration ──────────────────────────────────────────────────────
const isAtLive = ref(false)
const streamStartedAt = ref<Date | null>(null)
const now = useNow({ interval: 1000 })

watch(isPublishing, (publishing) => {
  streamStartedAt.value = publishing ? new Date() : null
})

const streamDuration = computed(() => {
  const startTime = isPublishing.value ? streamStartedAt.value : activeStream.value?.createdAt ? new Date(activeStream.value.createdAt) : null

  if (!startTime) return null
  if (!isPublishing.value && streamCollection.value?.status !== StreamStatus.Live) return null

  const elapsed = Math.floor((now.value.getTime() - startTime.getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(s).padStart(2, '0')].filter(Boolean).join(':')
})
</script>

<template>
  <div class="flex size-full flex-col gap-2 overflow-hidden md:flex-row">
    <!-- ── Main video area ────────────────────────────────────────────── -->
    <div class="relative flex grow flex-col overflow-hidden bg-black">
      <!--
        Single native <video> — always in the DOM so videoEl ref is always
        valid for both LiveKit attach() and srcObject assignment.
        :muted streamer preview avoids feedback; viewer needs audio on.
      -->
      <video ref="videoEl" autoplay playsinline :muted="loggedIn" class="size-full rounded-md object-contain" />

      <!-- ── STREAMER OVERLAYS ─────────────────────────────────────── -->
      <template v-if="loggedIn">
        <!-- Active: publishing or stream already live from another device -->
        <template v-if="isPublishing || streamCollection?.status === StreamStatus.Live">
          <!-- Top gradient: title + duration + live chip -->
          <div class="pointer-events-none absolute inset-x-0 top-0 z-10">
            <div class="flex w-full items-center justify-between gap-3 bg-gradient-to-b from-black/60 to-transparent p-4 pb-8">
              <div class="flex flex-col gap-1">
                <span class="font-medium text-lg capitalize text-white">
                  {{ streamCollection?.title }}
                </span>
                <span class="text-base lowercase text-white/60 first-letter:uppercase">
                  {{ activeStream?.deviceId?.replaceAll('-', ' ') }}
                </span>
              </div>

              <div class="pointer-events-auto flex items-center gap-2">
                <span v-if="streamDuration" class="font-mono rounded-full bg-black px-2 py-1 text-xs tabular-nums text-white">
                  {{ streamDuration }}
                </span>
                <span v-if="isConnecting" class="animate-pulse rounded-full bg-warning-500/20 px-2 py-1 text-xs text-warning-400"> Connecting… </span>
                <button @click="isAtLive = !isAtLive">
                  <LiveChip :status="isAtLive ? StreamStatus.Live : StreamStatus.Idle" />
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom controls — only while this device is publishing -->
          <div v-if="isPublishing" class="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10">
            <div class="flex items-center gap-1">
              <!-- Mic -->
              <div class="flex items-center rounded-full bg-white/10 backdrop-blur-sm">
                <button class="flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10">
                  <NuxtIcon name="local:microphone" class="text-[18px]" />
                </button>
                <div class="h-4 w-px bg-white/20" />
                <button class="flex items-center justify-center rounded-full p-2 text-white/60 transition hover:bg-white/20 hover:text-white">
                  <NuxtIcon name="local:chevron-bold" class="-rotate-90 text-[12px]" />
                </button>
              </div>
              <!-- Camera -->
              <div class="flex items-center rounded-full bg-white/10 backdrop-blur-sm">
                <button class="flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10">
                  <NuxtIcon name="local:camera" class="text-[18px]" />
                </button>
                <div class="h-4 w-px bg-white/20" />
                <button class="flex items-center justify-center rounded-full p-2 text-white/60 transition hover:bg-white/20 hover:text-white">
                  <NuxtIcon name="local:chevron-bold" class="-rotate-90 text-[12px]" />
                </button>
              </div>
            </div>
            <!-- End stream -->
            <button class="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition hover:bg-alert-500/80 hover:text-white" @click="stopStreaming">
              <NuxtIcon name="local:cross" class="text-[16px]" />
            </button>
          </div>
        </template>

        <!-- Starting state -->
        <template v-else-if="streamCollection?.status === StreamStatus.Starting">
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-cover bg-center" :style="{ backgroundImage: `url(${streamCollection?.poster})` }">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div class="relative z-10 flex flex-col items-center gap-4">
              <div class="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p class="text-neutral-400 text-sm">Stream is starting…</p>
            </div>
          </div>
        </template>

        <!-- Idle: ready to broadcast -->
        <template v-else>
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-cover bg-center" :style="{ backgroundImage: `url(${streamCollection?.poster})` }">
            <div class="absolute inset-0 bg-black/40" />
            <div class="relative z-10 text-center">
              <span class="font-medium text-xl capitalize text-white">{{ streamCollection?.title }}</span>
              <p class="mt-1 text-sm text-white/40">Ready to broadcast</p>
            </div>
            <button
              type="button"
              class="font-medium relative z-10 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-black transition hover:bg-white/90"
              @click="createStream">
              <span class="relative inline-flex size-2 rounded-full bg-alert-500" />
              Start Stream
            </button>
          </div>
        </template>
      </template>

      <!-- ── VIEWER OVERLAYS ──────────────────────────────────────────── -->
      <template v-else>
        <!-- Connecting spinner -->
        <div v-if="!isConnected" class="absolute inset-0 flex items-center justify-center bg-black/60">
          <div class="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>

        <!-- Stream ended -->
        <div v-if="isConnected && !isHostPresent" class="absolute inset-0 flex items-center justify-center">
          <p class="text-sm text-white/50">Stream has ended</p>
        </div>

        <!-- Live badge + viewer count -->
        <div v-if="isConnected && isHostPresent" class="absolute left-4 top-4 flex items-center gap-2">
          <span class="bg-red-500 font-semibold rounded-full px-2 py-1 text-xs uppercase text-white"> Live </span>
          <span class="rounded-full bg-black/60 px-2 py-1 text-xs text-white/70"> {{ viewerCount }} watching </span>
        </div>
      </template>
    </div>

    <!-- ── Sidebar: inactive streams + add camera (streamer only) ──────── -->
    <template v-if="loggedIn">
      <div class="scrollbar-hidden flex h-40 flex-shrink-0 flex-row overflow-x-auto overflow-y-hidden border-white/5 md:h-auto md:w-60 md:flex-col md:overflow-y-auto md:overflow-x-hidden xl:w-72">
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
                :muted="true"
                :playsinline="true"
                class="size-full object-cover opacity-80 transition group-hover:opacity-100" />
              <NuxtImg v-else-if="poster" :src="poster" class="size-full object-cover opacity-30" />
              <div v-else class="size-full bg-dark-500" />
              <LiveChip class="absolute right-2 top-2 scale-75" :status="status" />
            </div>
            <div class="px-3 py-2">
              <p class="font-medium truncate text-sm lowercase text-white/80 transition first-letter:uppercase group-hover:text-white">
                {{ deviceId?.replaceAll('-', ' ') }}
              </p>
            </div>
          </div>

          <!-- Add camera source -->
          <button type="button" class="group flex w-56 flex-shrink-0 cursor-pointer flex-col transition hover:bg-white/5 md:w-auto" @click="createStream">
            <div class="relative aspect-video w-full overflow-hidden bg-dark-500/50">
              <div class="flex size-full items-center justify-center">
                <div class="flex size-10 items-center justify-center rounded-full border border-dashed border-white/10 text-white/20 transition group-hover:border-white/30 group-hover:text-white/40">
                  <NuxtIcon name="local:plus" class="text-[16px]" />
                </div>
              </div>
            </div>
            <div class="px-3 py-2">
              <p class="font-medium text-xs text-white/30 transition group-hover:text-white/50">Add camera source</p>
            </div>
          </button>
        </div>
      </div>
    </template>

    <!-- ── Device selection modal ──────────────────────────────────────── -->
    <ModalDeviceSelect
      v-if="showDeviceModal && loggedIn"
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
