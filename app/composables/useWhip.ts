interface WhipOptions {
  baseUrl: string
  iceServers?: RTCIceServer[]
}

export function useWhip(options: WhipOptions) {
  // const {
  //   public: { turnUrl },
  // } = useRuntimeConfig()

  const {
    baseUrl,
    iceServers = [
      /*  {
         urls: `${turnUrl}?transport=tcp`,
         username: 'ome',
         credential: 'airen',
       }, */
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  } = options

  const isStreaming = ref(false)
  const error = ref<Error | null>(null)
  let pc: RTCPeerConnection | null = null
  let resourceUrl: string | null = null
  let etag: string | null = null

  async function sendIcePatch(candidate: RTCIceCandidate) {
    const res = await fetch(`${baseUrl}${resourceUrl}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/trickle-ice-sdpfrag',
        'If-Match': etag!,
      },
      body: `a=${candidate.candidate}\r\n`,
    })

    if (res.headers.has('ETag')) etag = res.headers.get('ETag')
  }

  async function start(stream: MediaStream, streamName: string) {
    try {
      const iceBuffer: RTCIceCandidate[] = []
      error.value = null

      stream.getVideoTracks().forEach((track) => {
        track.contentHint = 'motion'
      })

      pc = new RTCPeerConnection({
        iceServers,
        // iceTransportPolicy: 'relay'
      })

      pc.onicecandidate = async (event) => {
        if (!event.candidate) return
        console.log('ICE candidate:', event.candidate.type, event.candidate.protocol, event.candidate.address)

        if (!resourceUrl) {
          iceBuffer.push(event.candidate)
        } else {
          await sendIcePatch(event.candidate)
        }
      }
      pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', pc?.iceGatheringState)
      }
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc?.iceConnectionState)
      }
      pc.onicecandidateerror = (e) => {
        console.error('ICE error:', e.errorCode, e.errorText, e.url)
      }

      stream.getTracks().forEach((track) => pc!.addTrack(track, stream!))

      console.log({ getSetting: stream.getVideoTracks()[0]!.getSettings() })

      const transceivers = pc!.getTransceivers()
      const videoTransceiver = transceivers.find((t) => t.sender.track?.kind === 'video')

      if (videoTransceiver) {
        const sendCaps = RTCRtpSender.getCapabilities('video')
        const recvCaps = RTCRtpReceiver.getCapabilities('video')
        if (sendCaps && recvCaps) {
          const allCodecs = sendCaps.codecs.filter((sc) => recvCaps.codecs.some((rc) => rc.mimeType === sc.mimeType && rc.clockRate === sc.clockRate))
          const h264 = allCodecs.filter((c) => c.mimeType === 'video/H264')
          const rest = allCodecs.filter((c) => c.mimeType !== 'video/H264')
          videoTransceiver.setCodecPreferences([...h264, ...rest])
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const signalingUrl = `${baseUrl}/live/${streamName}?direction=whip&transport=tcp`
      const response = await fetch(signalingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp,
      })

      if (!response.ok) throw new Error(`WHIP error: ${response.status} ${await response.text()}`)

      resourceUrl = response.headers.get('Location')
      etag = response.headers.get('ETag')

      const answerSdp = await response.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      for (const sender of pc!.getSenders()) {
        const track = sender.track
        if (!track) continue
        const params = sender.getParameters()
        if (!params.encodings.length) params.encodings = [{}]

        if (track.kind === 'video') {
          params.encodings[0]!.maxBitrate = 8_000_000
          params.encodings[0]!.priority = 'high'
          params.encodings[0]!.networkPriority = 'high'
        } else if (track.kind === 'audio') {
          params.encodings[0]!.maxBitrate = 128_000
        }
        await sender.setParameters(params)
      }

      isStreaming.value = true

      for (const candidate of iceBuffer) {
        await sendIcePatch(candidate)
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err
      console.error('WHIP signaling failed', err)
      pc?.close()
      pc = null
    }
  }

  async function stop() {
    isStreaming.value = false
    pc?.getSenders().forEach((s) => s.track?.stop())
    pc?.close()
    pc = null
  }

  onUnmounted(() => stop())

  return {
    error,
    start,
    stop,
  }
}
