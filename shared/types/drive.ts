export type DriveCollaborator = {
  id: string
  name: string
  avatarUrl: string
}

export type DriveClient = {
  name: string
  avatarUrl: string
}

export type DriveFolder = {
  id: string
  title: string
  dateLabel: string
  statusLabel: string
  delivered: boolean
  photosCount: number
  videosCount: number
  client: DriveClient
  previewImages: string[]
}
