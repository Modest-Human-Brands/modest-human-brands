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
  clientName: string
  clientInitials: string
  status: string
  itemCount: number
}
