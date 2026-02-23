import type { ProjectClient } from './index'

export interface Stream {
  slug: string
  title: string
  rtmpUrl: string
  media: string
  poster: string
  streamKey: string
  deviceId: string
  isLive: boolean
  client?: ProjectClient
}
