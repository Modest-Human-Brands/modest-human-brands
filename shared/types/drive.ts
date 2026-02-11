import type { ProjectClient, ProjectStatus } from './index'

export type DriveFolder = {
  slug: string
  title: string
  date: string
  status: ProjectStatus
  client: ProjectClient
  mediaCount: {
    photo: number
    video: number
  }
  previewImages: string[]
}
