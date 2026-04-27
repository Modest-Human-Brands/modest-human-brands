<script setup lang="ts">
// import type { LayoutAction } from '~/components/AppActionbar.vue'

const slug = 'red-cat-pictures'
const { data: organizationData } = await useFetch(`/api/organization/${slug}`)

const DEFAULT_ORG = {
  name: 'Modest Human Brands',
  website: 'https://modesthumanbrands.com',
  branding: {
    logo: 'https://modesthumanbrands.com/logo.svg',
    color: { primary: '#4A85FF', accent: '' },
    font: '',
  },
  phone: '+912269711501',
  whatsapp: 'https://wa.me/912269711501',
}

const organization = computed(() => organizationData.value ?? (DEFAULT_ORG as Organization))
const route = useRoute()
const editedAt = 'Jan 17'
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })

const tabs = [
  {
    id: 'website-app',
    title: 'Website/App',
    icon: 'local:app',
    description: 'Manage all your website/app here',
  },
  {
    id: 'connect',
    title: 'Connect',
    icon: 'local:network',
    description: 'Manage all your connections/campaigns here',
  },
  {
    id: 'doc',
    title: 'Doc',
    icon: 'local:document',
    description: 'Manage all your documents here',
  },
  {
    id: 'coordinate',
    title: 'Coordinate',
    icon: 'local:node',
    description: 'Manage all your teams and clients communication here',
  },
  {
    id: 'sync',
    title: 'Sync',
    icon: 'local:stream',
    description: 'Manage all sync here',
  },
  {
    id: 'drive',
    title: 'Drive',
    icon: 'local:hard-drive',
    description: 'Manage all your assets here',
  },
]

const activeTab = computed(() => tabs.find(({ id }) => route.path.includes(id)) ?? tabs[0]!)

/**
 * Dynamic Breadcrumbs Logic
 */
const dynamicBreadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter((p) => p)
  const crumbs: { label: string; to: string; icon?: string }[] = []
  let pathAccumulator = ''

  pathSegments.forEach((segment, index) => {
    pathAccumulator += `/${segment}`

    const matchingTab = tabs.find((t) => t.id === segment)

    if (matchingTab) {
      crumbs.push({
        label: matchingTab.title,
        to: `/${matchingTab.id}`,
        icon: matchingTab.icon,
      })
    } else {
      const formattedLabel = segment
        .split('-')
        .filter((word) => isNaN(Number(word)))
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\d+$/, '')
        .trim()

      crumbs.push({
        label: formattedLabel || segment,
        to: pathAccumulator,
        icon: index === 0 ? 'ph:folder' : undefined,
      })
    }
  })

  return crumbs
})
</script>

<template>
  <div class="flex h-screen w-screen items-start justify-start bg-dark-400 font-main">
    <LazyAppNavbar :organization-name="organization.name" :organization-logo="organization.branding.logo" :active-key="activeTab.id" hydrate-on-idle />

    <main class="relative isolate mx-auto flex h-screen w-full grow flex-col overflow-hidden">
      <div class="scrollbar-hidden flex shrink-0 items-center justify-between overflow-x-auto px-2 py-6 pr-4 md:gap-6 md:px-4 md:pr-6">
        <AppBreadcrumb :items="dynamicBreadcrumbs" />
        <div class="flex shrink-0 flex-col items-end gap-2 md:gap-3">
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
        </div>
      </div>

      <div class="min-h-0 grow overflow-hidden">
        <slot />
      </div>
    </main>
  </div>
</template>
