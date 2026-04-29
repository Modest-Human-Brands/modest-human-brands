export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Converted'
export type CommunicationChannel = 'whatsapp' | 'email' | 'call' | 'instagram'

export interface Message {
  id: string
  senderName: string
  time: string
  text: string
  isOwn: boolean
}

export interface Conversation {
  id: string
  name: string
  msg: string
  time: string
  channel: CommunicationChannel
  unread: number
  active: boolean
  messages: Message[]
}

export interface Contact {
  id: string
  name: string
  initial: string
  company: string
  lastActive: string
  status: LeadStatus
  channels: CommunicationChannel[]
  jobTitle?: string
  email?: string
  phone?: string
  conversations: Conversation[]
}

export interface Channel {
  name: string
  icon: string
}
