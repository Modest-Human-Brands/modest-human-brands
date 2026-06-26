export type DocStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_SIGNED' | 'COMPLETED' | 'VOID'

export interface UIDocument {
  id: string
  name: string
  fileName: string
  extension: string // 'pdf', 'png', 'docx', 'xlsx'
  sizeBytes: number
  status: DocStatus
  templateId?: string
  previewUrl?: string
  createdAt: string
  updatedAt: string
  uploadedBy: { name: string; initial: string; avatarUrl?: string }
  project?: string
  source?: string
}

export interface DocFolder {
  id: string
  title: string
  contactName: string
  contactAvatar?: string | null
  status: string
  itemCount: number
}

export interface DocTimelineEvent {
  id: string
  date: string
  time: string
  userInitials: string
  userName: string
  action: string
}

export interface ProjectContact {
  id: string
  name: string
  email: string | null
}

export interface Project {
  id: string
  name: string
  contact?: ProjectContact | null
}

export interface DocumentDetail {
  previewUrl: string
  extension: string
  name: string
  formattedSize: string
  timeline: DocTimelineEvent[]
  project?: Project | null
  templateId?: string
}

export interface SignerFieldSchema {
  id: string
  type: string
  signerOrder: number
  pageIndex: number | string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  required?: boolean
  groupName?: string
}

export interface TemplateSchema {
  id: string
  variables: Record<string, unknown>
  signerFields?: SignerFieldSchema[]
}
