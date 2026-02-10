// import type { ProjectClient } from "./index";

interface ProjectClient {
  name: string
  avatarUrl: string
}

export type MediaType = 'photo' | 'video'

export type MediaMetadata = {
  size: number
  resolution: string
  bitDepth: string
  fps?: number
}

export type MediaItem = {
  id: string
  type: MediaType
  title: string
  fileCode: string
  thumbnailUrl: string
  metadata: MediaMetadata
}

export type ProjectStatus = {
  label: string
  delivered: boolean
}

export type ProjectDetail = {
  id: string
  slug: string
  title: string
  client: ProjectClient
  status: ProjectStatus
  photosCount: number
  videosCount: number
  mediaItems: MediaItem[]
}
