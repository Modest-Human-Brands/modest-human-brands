export type NavItem = {
  id: string
  label: string
  icon: string
  to?: string
}

export type Collaborator = {
  id: string
  name: string
  avatarUrl: string
}

export interface ProjectClient {
  name: string
  avatarUrl: string
}
