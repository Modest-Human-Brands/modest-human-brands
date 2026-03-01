import type { ProjectClient, ProjectStatus } from './index'

export interface ProjectMediaCollection {
  slug: string
  title: string
  date: string
  status: ProjectStatus
  client?: ProjectClient
  mediaCount: {
    photo: number
    video: number
  }
  previewImages: string[]
}
