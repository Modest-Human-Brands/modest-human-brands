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

export interface ProjectDeliverable {
  id: string
  title: string
  quantity?: number
  rate?: number
  description?: string
  points?: string[]
}

export interface DetailedProject extends Project {
  segment?: string
  date?: string
  duration?: string
  contactName?: string
  budget?: number
  additional?: string | Record<string, unknown> | null
  deliverables?: ProjectDeliverable[]
  markdown?: string | null
}
