export type ProjectStatus = 'Plan' | 'Crew' | 'Document' | 'Pre-Production' | 'Production' | 'Post-Production' | 'Delivered'

export interface ProjectClient {
  name: string
  avatar?: string
}

export interface Project {
  id: string
  index: number
  slug: string
  title: string
  status: ProjectStatus
  progress: number
  period: {
    start: string
    end: string
  }
  previews: string[]
  assignees: string[]
  shootLocation?: string
  shootDate?: string
  quoteNumber?: number
}

export const projectItemKinds = ['shoot', 'script', 'storyboard', 'look', 'setup'] as const

export type ProjectItemKind = (typeof projectItemKinds)[number]

export interface ProjectItem {
  id: string
  index: number
  title: string
  status?: string
  shootIds: string[]
  imageId?: string
  duration?: string
  tags: string[]
  documentId?: string
  scriptId?: string
  kind?: string
  specs?: string
  location?: string
  date?: string
  collaborators: { id: string; name: string; avatar?: string }[]
}

export interface ProjectDeliverable {
  id: string
  title: string
  quantity?: number
  rate?: number
  description?: string
  points?: string[]
}

export interface DetailedProject extends Project {
  updatedAt?: string
  segment?: string
  date?: string
  duration?: string
  contactName?: string
  budget?: number
  additional?: string | Record<string, unknown> | null
  deliverables?: ProjectDeliverable[]
  markdown?: string | null
}

export interface ProjectCrewMember {
  id: string
  name: string
  department: string
  role: string
  status: string
  rate: number
  rateType: string
  totalAgreedRate: number
  email: string
  phone?: string
  portfolioLink?: string
  location?: string
  notes?: string
}

export const projectDocumentStatuses = ['draft', 'ready', 'sent', 'partially-signed', 'completed', 'void'] as const

export type ProjectDocumentStatus = (typeof projectDocumentStatuses)[number]

export interface ProjectDocument {
  id: string
  title: string
  fileType: string
  status: ProjectDocumentStatus
  updatedAt: string
  sizeBytes: number
  contact?: { name: string; avatar?: string }
  previewUrl: string
}
