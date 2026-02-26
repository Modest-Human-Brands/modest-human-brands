<script setup lang="ts">
import Hls from 'hls.js'

const {
  public: { cdnUrl },
} = useRuntimeConfig()

type Orientation = 'portrait' | 'landscape'

const props = withDefaults(
  defineProps<{
    media: string
    multiOrentation?: boolean
    poster?: string
    controlsList?: string
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
    multiOrentation: false,
    poster: undefined,
    controlsList: undefined,
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
}>()

const baseUrl = computed(() => props.baseUrl ?? cdnUrl)

const LIVE_THRESHOLD = 8

const videoRef = useTemplateRef<HTMLVideoElement>('videoRef')
let player: Hls

function seekToLive() {
  if (!videoRef.value) return
  const target = player?.liveSyncPosition ?? videoRef.value.duration
  if (isFinite(target)) videoRef.value.currentTime = target
}

defineExpose({ videoRef, seekToLive })

watch(
  () => props.state,
  async (value) => {
    switch (value) {
      case 'play':
        await videoRef.value?.play()
        break
      case 'pause':
        videoRef.value?.pause()
        break
      case 'stop':
        videoRef.value?.pause()
        break
    }
  }
)

const progress = ref(0)
const isVideoLoaded = ref(false)

function handleError(e?: Error) {
  console.error('Video Error occurred:', e)
}

function handleCanPlay() {
  // console.log('Video can start playing')
}

function handlePlay() {
  // console.log('Video played')
}

function handlePause() {
  // console.log('Video paused')
}

function handleLoadedData() {
  isVideoLoaded.value = true
}

function handleProgress() {
  if (!videoRef.value) return
  const { currentTime, duration } = videoRef.value
  if (duration > 0) {
    progress.value = currentTime / duration
    emit('progress', progress.value)
    emit('atLive', !isFinite(duration) || duration === 0 || duration - currentTime <= LIVE_THRESHOLD)
  }
}

function handleEnded() {
  progress.value = 1
  emit('progress', progress.value)
  emit('ended')
}

function handleLoadedMetadata() {
  isVideoLoaded.value = true
  emit('ready')
  if (props.live) seekToLive()
}

const { width, height } = useElementSize(videoRef)

const streamStats = ref({ bitrate: 0, codec: '', resolution: '' })
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formattedBitrate = computed(() => {
  const bps = streamStats.value.bitrate || 0
  return bps > 1000000 ? `${(bps / 1000000).toFixed(2)} Mbps` : `${Math.round(bps / 1000)} kbps`
})

const currentOrientation = computed<Orientation>(() => (width.value > height.value ? 'landscape' : 'portrait'))
const activeSource = computed(() => (props.multiOrentation ? `${props.media}-${currentOrientation.value}` : props.media))

onMounted(() => {
  const url = `${baseUrl.value}/${activeSource.value}`

  if (Hls.isSupported()) {
    player = new Hls({ liveSyncDurationCount: 3 })
    player.loadSource(url)
    player.attachMedia(videoRef.value!)

    player.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      const level = player.levels[data.level]
      if (level) {
        streamStats.value = {
          bitrate: level.bitrate || 0,
          codec: level.videoCodec || 'unknown',
          resolution: level.width && level.height ? `${level.width}x${level.height}` : 'unknown',
        }
      }
    })

    player.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) handleError(new Error(data.details))
    })

    if (props.autoplay) videoRef.value?.play()
  } else if (videoRef.value?.canPlayType('application/vnd.apple.mpegurl')) {
    videoRef.value.src = url
    if (props.autoplay) videoRef.value.play()
  }
})

watch(activeSource, (newSource, oldSource) => {
  if (!player || newSource === oldSource) return
  const currentTime = videoRef.value?.currentTime || 0
  const wasPlaying = !videoRef.value?.paused
  player.loadSource(`${baseUrl.value}/${newSource}`)
  player.attachMedia(videoRef.value!)
  player.once(Hls.Events.MANIFEST_PARSED, () => {
    if (videoRef.value) videoRef.value.currentTime = currentTime
    if (wasPlaying) videoRef.value?.play()
  })
})

onUnmounted(() => player?.destroy())
</script>

<template>
  <video
    ref="videoRef"
    class="size-full"
    :poster="poster"
    :controlsList="controlsList"
    :preload="preload"
    :controls="controls"
    :autoplay="autoplay"
    :muted="muted"
    :playsinline="playsinline"
    :disablePictureInPicture="disablePictureInPicture"
    :class="{ shimmer: !isVideoLoaded }"
    @error="handleError()"
    @canplay="handleCanPlay"
    @play="handlePlay"
    @pause="handlePause"
    @timeupdate="handleProgress"
    @ended="handleEnded"
    @loadeddata="handleLoadedData"
    @loadedmetadata="handleLoadedMetadata"
    @contextmenu.prevent>
    Your browser does not support the video tag.
  </video>
  <!-- STATS OVERLAY -->
  <!-- <div v-if="isVideoLoaded"
      class="absolute bottom-2 right-2 bg-black/60 text-white text p-2 rounded font-mono pointer-events-none">
      <p>Bitrate: {{ formattedBitrate }}</p>
      <p>Resolution: {{ streamStats.resolution }}</p>
      <p>Codec: {{ streamStats.codec }}</p>
      <p>Buffer: {{ buffer }} sec</p>
    </div> -->
  <!-- </div> -->
</template>
