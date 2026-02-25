import type { ProjectClient } from './index'

export interface Stream {
  slug: string
  title: string
  streamUrl: string
  media: string
  poster: string
  deviceId: string
  isLive: boolean
  client?: ProjectClient
}
