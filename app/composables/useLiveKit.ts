import type { LocalVideoTrack, LocalAudioTrack, RemoteTrack } from 'livekit-client'
import { Room, RoomEvent, Track, createLocalVideoTrack, createLocalAudioTrack } from 'livekit-client'

export function useLiveKit() {
  const room = shallowRef<Room | null>(null)

  const isConnecting = ref(false)
  const isConnected = ref(false)

  const isPublishing = ref(false)
  const localVideoTrack = shallowRef<LocalVideoTrack | null>(null)
  const localAudioTrack = shallowRef<LocalAudioTrack | null>(null)

  const remoteVideoTrack = shallowRef<RemoteTrack | null>(null)
  const remoteAudioTrack = shallowRef<RemoteTrack | null>(null)
  const viewerCount = ref(0)
  const isHostPresent = ref(false)

  function createRoom() {
    const r = new Room({ adaptiveStream: true, dynacast: true })
    room.value = r
    return r
  }

  function updateViewerState() {
    const r = room.value
    if (!r) return
    const participants = [...r.remoteParticipants.values()]
    viewerCount.value = participants.filter((p) => !p.identity.startsWith('host-')).length
    isHostPresent.value = participants.some((p) => p.identity.startsWith('host-'))
  }

  function registerViewerEvents(r: Room, videoEl: HTMLVideoElement) {
    r.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      if (!participant.identity.startsWith('host-')) return
      if (track.kind === Track.Kind.Video) {
        track.attach(videoEl)
        remoteVideoTrack.value = track
      }
      if (track.kind === Track.Kind.Audio) {
        track.attach()
        remoteAudioTrack.value = track
      }
    })
    r.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach()
      if (track === remoteVideoTrack.value) remoteVideoTrack.value = null
      if (track === remoteAudioTrack.value) remoteAudioTrack.value = null
    })
    r.on(RoomEvent.ParticipantConnected, updateViewerState)
    r.on(RoomEvent.ParticipantDisconnected, updateViewerState)
  }

  // ── Publisher ─────────────────────────────────────────────────────────────
  async function startPublishing(
    livekitUrl: string,
    token: string,
    videoEl: HTMLVideoElement,
    videoDeviceId?: string, // ← new: forwards selected device to LiveKit
    audioDeviceId?: string // ← new
  ) {
    isConnecting.value = true
    try {
      const r = createRoom()
      await r.connect(livekitUrl, token)

      const [vTrack, aTrack] = await Promise.all([
        createLocalVideoTrack({
          deviceId: videoDeviceId,
          resolution: { width: 1280, height: 720, frameRate: 30 },
        }),
        createLocalAudioTrack({ deviceId: audioDeviceId }),
      ])

      localVideoTrack.value = vTrack
      localAudioTrack.value = aTrack
      vTrack.attach(videoEl)

      await Promise.all([r.localParticipant.publishTrack(vTrack), r.localParticipant.publishTrack(aTrack)])

      isConnected.value = true
      isPublishing.value = true
    } finally {
      isConnecting.value = false
    }
  }

  async function stopPublishing() {
    localVideoTrack.value?.detach()
    localVideoTrack.value?.stop()
    localAudioTrack.value?.stop()
    await room.value?.disconnect()
    room.value = null
    localVideoTrack.value = null
    localAudioTrack.value = null
    isPublishing.value = false
    isConnected.value = false
  }

  // ── Viewer ────────────────────────────────────────────────────────────────
  async function startViewing(livekitUrl: string, token: string, videoEl: HTMLVideoElement) {
    isConnecting.value = true
    try {
      const r = createRoom()
      registerViewerEvents(r, videoEl)
      await r.connect(livekitUrl, token)
      isConnected.value = true
      updateViewerState()
    } finally {
      isConnecting.value = false
    }
  }

  async function stopViewing() {
    remoteVideoTrack.value?.detach()
    remoteAudioTrack.value?.detach()
    await room.value?.disconnect()
    room.value = null
    remoteVideoTrack.value = null
    remoteAudioTrack.value = null
    isConnected.value = false
    isHostPresent.value = false
    viewerCount.value = 0
  }

  return {
    isConnecting,
    isConnected,
    isPublishing,
    localVideoTrack,
    localAudioTrack,
    startPublishing,
    stopPublishing,
    remoteVideoTrack,
    remoteAudioTrack,
    viewerCount,
    isHostPresent,
    startViewing,
    stopViewing,
  }
}
