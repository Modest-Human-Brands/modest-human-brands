<script setup lang="ts">
const { emitAction } = useLayoutActions()
const route = useRoute()

const slug = ref('red-cat-pictures')
const { data: organizationData } = await useFetch(`/api/organization/${slug.value}`)

const organization = computed(() => {
  if (organizationData.value) return organizationData.value
  return {
    name: 'Modest Human Brands',
    branding: {
      logo: 'https://modesthumanbrands.com/logo.svg',
    },
  }
})

const editedAt = ref('Jan 17')
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
</script>

<template>
  <div class="flex h-screen w-screen items-start justify-start bg-dark-400 font-main text-white">
    <LazyAppNavbar :organization-name="organization.name" :organization-logo="organization.branding.logo" :active-key="activeTab.id" hydrate-on-idle />

    <main class="relative isolate mx-auto flex h-screen w-full grow flex-col overflow-hidden">
      <div class="flex shrink-0 items-start justify-between px-2 pr-4 pt-6 md:gap-6 md:px-4 md:pr-6">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-4">
            <NuxtIcon :name="activeTab.icon" class="text-4xl md:text-5xl" />
            <h1 class="hidden text-3xl font-bold tracking-tight md:inline">
              {{ activeTab.title }}
            </h1>
          </div>
          <p class="hidden text-sm text-white md:inline">
            {{ activeTab.description }}
          </p>
        </div>

        <div class="scrollbar-hidden flex shrink-0 flex-col items-end gap-3 overflow-x-auto">
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators || []" />
          <AppActionbar @create="emitAction('create', { type: activeTab.id, source: 'top-bar' })" />
        </div>
      </div>

      <div class="min-h-0 grow">
        <slot />
      </div>
    </main>
  </div>
</template>
