export interface CoordinateConversation {
  id: string
  type: 'people' | 'projects' | 'topics'
  name: string
  snippet: string
  projectContext: string
  lastActive: string
  avatarUrl: string | null
}
