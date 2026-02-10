// import type { ProjectClient } from "./index";

interface ProjectClient {
  name: string
  avatarUrl: string
}

export type DriveFolder = {
  id: string
  title: string
  dateLabel: string
  status: {
    label: string
    delivered: boolean
  }
  photosCount: number
  videosCount: number
  client: ProjectClient
  previewImages: string[]
}
