<script setup lang="ts">
import type { MediaPlayerClass, Representation } from 'dashjs'

const {
  public: { cdnUrl },
} = useRuntimeConfig()

enum VideoQuality {
  Auto = 'auto',
  UHD = '2160p',
  FHD = '1080p',
  HD = '720p',
  SD = '480p',
}

const HEIGHT_TO_QUALITY: Record<number, VideoQuality> = {
  2160: VideoQuality.UHD,
  1080: VideoQuality.FHD,
  720: VideoQuality.HD,
  480: VideoQuality.SD,
}

interface QualityOption {
  label: VideoQuality
  index: number
  bitrate: number
}

interface DashVideoElement extends HTMLElement {
  engine: MediaPlayerClass
  play(): Promise<void>
  pause(): void
  currentTime: number
  duration: number
  paused: boolean
  seekable: TimeRanges
}

type Orientation = 'portrait' | 'landscape'

const props = withDefaults(
  defineProps<{
    media?: string
    multiOrentation?: boolean
    aspectRatio?: string
    poster?: string
    preload?: 'none' | 'metadata' | 'auto'
    controls?: boolean
    autoplay?: boolean
    state?: 'play' | 'pause' | 'stop'
    muted?: boolean
    playsinline?: boolean
    disablePictureInPicture?: boolean
    baseUrl?: string
    live?: boolean
  }>(),
  {
    media: undefined,
    multiOrentation: false,
    aspectRatio: '16:9',
    poster: undefined,
    preload: 'auto',
    controls: false,
    autoplay: false,
    state: 'stop',
    muted: false,
    playsinline: false,
    disablePictureInPicture: false,
    baseUrl: undefined,
    live: false,
  }
)

const emit = defineEmits<{
  started: []
  buffer: [value: number]
  progress: [value: number]
  ended: []
  ready: []
  atLive: [value: boolean]
  qualityChange: [quality: VideoQuality]
}>()

const baseUrl = computed(() => props.baseUrl ?? cdnUrl)
const wrapperRef = useTemplateRef<HTMLElement>('wrapperRef')
const videoRef = useTemplateRef<DashVideoElement>('videoRef')

const pendingSeekTime = ref<number | null>(null)
const pendingPlayState = ref<boolean>(false)
const isVideoLoaded = ref(false)
const isPlaying = ref(false)
const progress = ref(0)

const availableQualities = ref<QualityOption[]>([])
const selectedQuality = ref<VideoQuality>(VideoQuality.Auto)
const showQualityMenu = ref(false)

function labelForRepresentation(r: Representation): VideoQuality {
  return HEIGHT_TO_QUALITY[r.height] ?? (`${Math.round(r.bandwidth / 1000)}k` as VideoQuality)
}

function loadAvailableQualities() {
  const el = videoRef.value
  if (!el?.engine) return
  const reps: Representation[] = el.engine.getRepresentationsByType('video')

  availableQualities.value = reps
    .slice()
    .sort((a, b) => b.bandwidth - a.bandwidth)
    .map((r) => ({
      label: labelForRepresentation(r),
      index: r.index,
      bitrate: r.bandwidth,
    }))

  console.log({ availableQualities: availableQualities.value })
}

function applyQuality(q: VideoQuality) {
  const el = videoRef.value
  if (!el?.engine) return

  if (q === VideoQuality.Auto) {
    el.engine.updateSettings({
      streaming: { abr: { autoSwitchBitrate: { video: true } } },
    })
  } else {
    const option = availableQualities.value.find((o) => o.label === q)
    if (!option) return
    el.engine.updateSettings({
      streaming: { abr: { autoSwitchBitrate: { video: false } } },
    })
    el.engine.setRepresentationForTypeByIndex('video', option.index)
  }

  selectedQuality.value = q
  showQualityMenu.value = false
  emit('qualityChange', q)
}

function seekToLive() {
  const el = videoRef.value
  if (!el) return
  if (el.seekable.length > 0) {
    el.currentTime = el.seekable.end(el.seekable.length - 1)
  } else if (isFinite(el.duration)) {
    el.currentTime = el.duration
  }
}

defineExpose({ videoRef, seekToLive, applyQuality })

watch(
  () => props.state,
  async (value) => {
    const el = videoRef.value
    if (!el) return
    switch (value) {
      case 'play':
        await el.play()
        break
      case 'pause':
      case 'stop':
        el.pause()
        break
    }
  }
)

function handleStreamReady() {
  // Fired when manifest is parsed — representations are available
  loadAvailableQualities()
}

function handleCanPlay() {
  isVideoLoaded.value = true
  emit('ready')

  const el = videoRef.value
  if (!el) return

  if (pendingSeekTime.value !== null) {
    el.currentTime = pendingSeekTime.value
    pendingSeekTime.value = null
  }
  if (pendingPlayState.value) {
    el.play()
    pendingPlayState.value = false
  }
  if (props.live) seekToLive()
}

watch(videoRef, async (el, _, onCleanup) => {
  if (!el?.engine || !import.meta.client) return

  const { MediaPlayer } = await import('dashjs')
  const { events } = MediaPlayer

  el.engine.on(events.STREAM_INITIALIZED, handleStreamReady)
  el.engine.on(events.CAN_PLAY, handleCanPlay)
  onCleanup(() => {
    el.engine.off(events.STREAM_INITIALIZED, handleStreamReady)
    el.engine.off(events.CAN_PLAY, handleCanPlay)
  })
})

function handlePlay() {
  isPlaying.value = true
  emit('started')
}
function handlePause() {
  isPlaying.value = false
}

function handleTimeUpdate(event: Event) {
  const el = event.target as DashVideoElement
  if (el.duration > 0) {
    progress.value = el.currentTime / el.duration
    emit('progress', progress.value)
    if (props.live && el.seekable.length > 0) {
      const liveEdge = el.seekable.end(el.seekable.length - 1)
      emit('atLive', liveEdge - el.currentTime <= 2)
    }
  }
}

function handleEnded() {
  progress.value = 1
  emit('progress', 1)
  emit('ended')
}

const { width, height } = useElementSize(wrapperRef)
const currentOrientation = computed<Orientation>(() => (width.value > height.value ? 'landscape' : 'portrait'))
const activeSource = computed(() => (props.multiOrentation ? `${props.media}-${currentOrientation.value}` : props.media))
const videoUrl = computed(() => (activeSource.value ? `${baseUrl.value}/${activeSource.value}` : ''))

watch(videoUrl, (newUrl, oldUrl) => {
  const el = videoRef.value
  if (!el || newUrl === oldUrl || !oldUrl) return
  pendingSeekTime.value = el.currentTime
  pendingPlayState.value = !el.paused

  availableQualities.value = []
  selectedQuality.value = VideoQuality.Auto
})

onMounted(() => {
  import('@videojs/html/video/minimal-skin')
  import('@videojs/html/video/minimal-skin.css')
  import('@videojs/html/video/player')
  import('@videojs/html/media/dash-video')
  import('@videojs/html/media/hls-video')
})

const isDash = computed(() => {
  return videoUrl.value?.toLowerCase().endsWith('.mpd') || false
})
</script>

<template>
  <div ref="wrapperRef" class="group relative flex size-full items-center justify-center" :style="{ aspectRatio: calculateAspectRatio(aspectRatio) }" @click.self="showQualityMenu = false">
    <ClientOnly>
      <video-player class="size-full" :class="{ shimmer: !isVideoLoaded }">
        <video-minimal-skin v-if="controls" class="size-full">
          <dash-video
            v-if="isDash"
            ref="videoRef"
            class="size-full"
            :src="videoUrl"
            :poster="poster"
            :preload="preload"
            :autoplay="autoplay"
            :muted="muted"
            :playsinline="playsinline"
            :stream-type="live ? 'live' : 'on-demand'"
            crossorigin
            @play="handlePlay"
            @pause="handlePause"
            @time-update="handleTimeUpdate"
            @ended="handleEnded"
            @contextmenu.prevent />
          <hls-video
            v-else
            ref="videoRef"
            class="size-full"
            :src="videoUrl"
            :poster="poster"
            :preload="preload"
            :autoplay="autoplay"
            :muted="muted"
            :playsinline="playsinline"
            :stream-type="live ? 'live' : 'on-demand'"
            crossorigin
            @play="handlePlay"
            @pause="handlePause"
            @time-update="handleTimeUpdate"
            @ended="handleEnded"
            @contextmenu.prevent />
        </video-minimal-skin>

        <media-container v-else class="size-full">
          <dash-video
            v-if="isDash"
            ref="videoRef"
            class="size-full"
            :src="videoUrl"
            :poster="poster"
            :preload="preload"
            :autoplay="autoplay"
            :muted="muted"
            :playsinline="playsinline"
            :stream-type="live ? 'live' : 'on-demand'"
            crossorigin
            @play="handlePlay"
            @pause="handlePause"
            @time-update="handleTimeUpdate"
            @ended="handleEnded"
            @contextmenu.prevent />
          <hls-video
            v-else
            ref="videoRef"
            class="size-full"
            :src="videoUrl"
            :poster="poster"
            :preload="preload"
            :autoplay="autoplay"
            :muted="muted"
            :playsinline="playsinline"
            :stream-type="live ? 'live' : 'on-demand'"
            crossorigin
            @play="handlePlay"
            @pause="handlePause"
            @time-update="handleTimeUpdate"
            @ended="handleEnded"
            @contextmenu.prevent />
        </media-container>
      </video-player>
    </ClientOnly>
  </div>
</template>

<style>
.media-minimal-skin ::slotted(video) {
  border-radius: 0 !important;
  border-width: 0 !important;
}

.media-minimal-skin video {
  border-radius: 0 !important;
}
</style>
