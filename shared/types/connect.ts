export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Converted'
export type CommunicationPlatform = 'whatsapp' | 'email' | 'call' | 'instagram'

export interface Contact {
  id: string
  name: string
  company: string
  lastActive: string
  status: LeadStatus
  platforms: CommunicationPlatform[]
  jobTitle?: string // Optional field
  email?: string // Optional field
  phone?: string // Optional field
}
