export type ChannelType = 'email' | 'whatsapp' | 'instagram' | 'phone' | 'sms'

export const CONNECT_CHANNELS: { id: ChannelType; name: string; icon: string }[] = [
  { id: 'email', name: 'Email', icon: 'local:email' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'local:whatsapp' },
  { id: 'instagram', name: 'Instagram', icon: 'local:instagram' },
  { id: 'sms', name: 'SMS', icon: 'local:chat' },
  { id: 'phone', name: 'Phone', icon: 'local:phone' },
]

export interface CoordinateConversation {
  id: string
  type: 'people' | 'projects' | 'topics'
  name: string
  snippet: string
  projectContext: string
  lastActive: string
  avatarUrl: string | null
}

export interface ChatMessage {
  id: string
  content: string
  senderName: string
  senderInitial: string
  time: string
  isOwn: boolean
  dateGroup?: string
  channel?: ChannelType
  status?: 'sending' | 'sent' | 'error'
  metadata?: {
    subject?: string
    hasAttachments?: boolean
    [key: string]: string | boolean | undefined
  }
}

export interface ChatContact {
  id: string
  name: string
  initial: string
  company: string
  lastActive: string
  lastMessageSnippet: string
  activeChannel: ChannelType
  availableChannels: ChannelType[]
}
