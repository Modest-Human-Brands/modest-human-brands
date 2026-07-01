export type NavItem = {
  id: string
  title: string
  icon: string
  description: string
  to: string
}

export const PRIMARY_NAVIGATION_TABS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'local:grid',
    description: 'Manage all your website/app here',
    to: '/dashboard',
  },
  // {
  //   id: 'website-app',
  //   title: 'Website/App',
  //   icon: 'local:app',
  //   description: 'Manage all your website/app here',
  //   to: '/website-app'
  // },
  {
    id: 'connect',
    title: 'Connect',
    icon: 'local:network',
    description: 'Manage all your connections/campaigns here',
    to: '/connect',
  },
  {
    id: 'doc',
    title: 'Doc',
    icon: 'local:document',
    description: 'Manage all your documents here',
    to: '/doc',
  },
  {
    id: 'coordinate',
    title: 'Coordinate',
    icon: 'local:node',
    description: 'Manage all your teams and clients communication here',
    to: '/coordinate',
  },
  {
    id: 'sync',
    title: 'Sync',
    icon: 'local:stream',
    description: 'Manage all sync here',
    to: '/sync',
  },
  {
    id: 'drive',
    title: 'Drive',
    icon: 'local:hard-drive',
    description: 'Manage all your assets here',
    to: '/drive',
  },
] as NavItem[]

export const SECONDARY_NAVIGATION_TABS = [
  // {
  //   id: 'client',
  //   title: 'Client',
  //   icon: 'local:briefcase',
  //   description: 'Manage all your clients here',
  //   to: '/client'
  // },
  // {
  //   id: 'project',
  //   title: 'Project',
  //   icon: 'local:target-fill',
  //   description: 'Manage all your projects here',
  //   to: '/project'
  // },
  {
    id: 'transaction',
    title: 'Transaction',
    icon: 'local:journal',
    description: 'Manage all your transactions here',
    to: '/transaction',
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: 'local:court-hammer',
    description: 'Manage all your compliances here',
    to: '/compliance',
  },
  // {
  //   id: 'content',
  //   title: 'Content',
  //   icon: 'local:book',
  //   description: 'Manage all your content here',
  //   to: '/content'
  // },
] as NavItem[]
