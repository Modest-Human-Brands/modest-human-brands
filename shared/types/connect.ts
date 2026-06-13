export type ChannelType = 'email' | 'whatsapp' | 'instagram' | 'phone' | 'sms'

export interface InboxMessage {
  id: string
  text: string
  senderName: string
  senderInitial: string
  time: string
  isOwn: boolean
  dateGroup?: string
  channel: ChannelType
  status?: 'sending' | 'sent' | 'error'
}

export interface InboxContact {
  id: string
  name: string
  initial: string
  company: string
  lastActive: string
  lastMessageSnippet: string
  activeChannel: ChannelType
  availableChannels: ChannelType[]
}
