import { RoomServiceClient, AccessToken } from 'livekit-server-sdk'

let _roomService: RoomServiceClient | null = null

interface StreamMeta {
  slug: string
  title: string
  createdAt: number
}

export function getRoomService() {
  const config = useRuntimeConfig()
  if (!_roomService) {
    _roomService = new RoomServiceClient(config.public.livekitUrl, config.private.livekitApiKey, config.private.livekitApiSecret)
  }
  return _roomService
}

export function createToken(identity: string, name: string, room: string, canPublish: boolean) {
  const config = useRuntimeConfig()
  const token = new AccessToken(config.private.livekitApiKey, config.private.livekitApiSecret, {
    identity,
    name,
  })
  token.addGrant({ room, roomJoin: true, canPublish, canSubscribe: true, canPublishData: true })
  return token.toJwt()
}

// Global singleton — persists across requests, resets on server restart
const streams = new Map<string, StreamMeta>()

export const streamStore = {
  set(slug: string, meta: Omit<StreamMeta, 'slug'>) {
    streams.set(slug, { slug, ...meta })
  },
  get(slug: string) {
    return streams.get(slug) ?? null
  },
  delete(slug: string) {
    streams.delete(slug)
  },
  all() {
    return [...streams.values()]
  },
}
