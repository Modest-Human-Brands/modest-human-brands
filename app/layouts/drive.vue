<script setup lang="ts">
// const route = useRoute()
// const showFooter = computed(() => route.path === '/')

const collaborators: DriveCollaborator[] = [
  { id: 'c1', name: 'A', avatarUrl: 'https://picsum.photos/seed/collab1/64/64' },
  { id: 'c2', name: 'B', avatarUrl: 'https://picsum.photos/seed/collab2/64/64' },
  { id: 'c3', name: 'C', avatarUrl: 'https://picsum.photos/seed/collab3/64/64' },
]
</script>

<template>
  <div class="flex min-h-screen w-screen items-start justify-start">
    <LazyAppNavbar brand="Modest Human Brands" active-key="drive" hydrate-on-idle />
    <main class="relative isolate mx-auto w-full flex-1 grow gap-4 overflow-hidden px-2 py-6 md:mb-8 md:px-4">
      <div class="flex items-start justify-between gap-6">
        <div class="min-w-0">
          <div class="flex items-center gap-3">
            <NuxtIcon name="local:hard-drive" class="text-[64px]" />
            <h1 class="font-semibold truncate text-3xl">Drive</h1>
          </div>
          <p class="mt-2 text-sm text-white/60">Manage all your assets here</p>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-3">
          <AppActivitybar edited-label="Jan 17" :collaborators="collaborators" :extra-count="4" />
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
