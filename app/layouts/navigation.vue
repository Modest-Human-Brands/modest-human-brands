<script setup lang="ts">
const route = useRoute()
// const showFooter = computed(() => route.path === '/')

const editedAt = 'Jan 17'
const collaborators: Collaborator[] = [
  { id: 'c1', name: 'A', avatarUrl: 'https://picsum.photos/seed/collab1/64/64' },
  { id: 'c2', name: 'B', avatarUrl: 'https://picsum.photos/seed/collab2/64/64' },
  { id: 'c3', name: 'C', avatarUrl: 'https://picsum.photos/seed/collab3/64/64' },
  { id: 'c4', name: 'D', avatarUrl: 'https://picsum.photos/seed/collab4/64/64' },
  { id: 'c5', name: 'E', avatarUrl: 'https://picsum.photos/seed/collab5/64/64' },
]

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
  <div class="flex h-screen w-screen items-start justify-start">
    <LazyAppNavbar brand="Modest Human Brands" :active-key="activeTab.id" hydrate-on-idle />
    <main class="relative isolate mx-auto flex h-screen w-full grow flex-col gap-4 overflow-hidden px-2 py-6 md:mb-8 md:px-4">
      <div class="flex items-start justify-between gap-6">
        <div class="min-w-0">
          <div class="flex items-center gap-3">
            <NuxtIcon :name="activeTab.icon" class="text-[64px]" />
            <h1 class="font-semibold truncate text-3xl">{{ activeTab.title }}</h1>
          </div>
          <p class="mt-2 text-sm text-white/60">{{ activeTab.description }}</p>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-3">
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
          <AppActionbar />
        </div>
      </div>
      <slot />
    </main>
    <button type="button" class="fixed bottom-6 right-6 rounded-full bg-dark-500 p-2.5 text-white/80 hover:text-white" aria-label="AI Assistent">
      <NuxtIcon name="local:chain" class="text-[36px]" />
    </button>
  </div>
</template>
