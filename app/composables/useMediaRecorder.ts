export function useMediaRecorder({ stream }: { stream: MaybeRefOrGetter<MediaStream> }) {
  const mediaRecorder = ref<MediaRecorder>()
  const mimeType = ref<'video/mp4' | 'video/webm'>('video/mp4')
  const isSupported = ref<boolean>(true)
  const isInit = ref(false)
  const isStarted = ref(false)
  const blobs = ref<BlobPart[]>([])
  const video = ref<Blob>()
  const route = useRoute()
  const id = computed(() => route.query.id?.toString() ?? '')

  function checkSupported(mimeType: string): boolean {
    if (!window.MediaRecorder) {
      return false
    } else if (!MediaRecorder.isTypeSupported) {
      return mimeType.startsWith('audio/mp4') || mimeType.startsWith('video/mp4')
    }
    return MediaRecorder.isTypeSupported(mimeType)
  }

  onMounted(async () => {
    if (checkSupported('video/mp4')) {
      mimeType.value = 'video/mp4'
    } else if (checkSupported('video/webm')) {
      mimeType.value = 'video/webm'
    } else {
      await $fetch('/api/error', {
        method: 'POST',
        body: {
          id: id.value,
          message: 'MediaRecorder not supported in this browser',
          browserAgent: `${navigator?.userAgent}`,
        },
      })
      isSupported.value = false
      throw new Error('MediaRecorder not supported in this browser')
    }
  })

  function init() {
    mediaRecorder.value = new MediaRecorder(toValue(stream), { mimeType: mimeType.value })

    mediaRecorder.value.addEventListener('dataavailable', async (event) => {
      if (event.data) blobs.value.push(event.data)
    })

    mediaRecorder.value.addEventListener('start', () => {
      // alert('mediaRecorder Started')
      video.value = undefined
    })

    mediaRecorder.value.addEventListener('stop', () => {
      // alert('mediaRecorder Stopped')
      if (!blobs.value.length) return
      video.value = new Blob(blobs.value, { type: mediaRecorder.value!.mimeType })

      blobs.value = []
    })
    isInit.value = true
  }

  function start() {
    if (!isInit.value) init()
    isStarted.value = true
    mediaRecorder.value!.start(1000)
  }
  function stop() {
    isStarted.value = false
    mediaRecorder.value!.stop()
  }

  function restart() {
    stop()
    start()
  }

  return { isSupported, start, stop, restart, video }
}
