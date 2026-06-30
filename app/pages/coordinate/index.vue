<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { conversations, pending } = useCoordinate()
</script>

<template>
  <main class="relative flex size-full select-none overflow-hidden bg-dark-400">
    <div class="hidden h-full min-w-0 flex-1 flex-col md:flex">
      <ConnectChatArea :active-contact="null" :messages="[]" />
    </div>

    <CoordinateSidebar v-if="conversations?.length && !pending" :conversations="conversations" :active-id="null" />

    <aside v-else-if="pending" class="hidden h-full shrink-0 border-l border-white/5 md:flex md:w-[400px] md:flex-col md:gap-2.5 md:p-4">
      <div v-for="i in 8" :key="i" class="h-16 w-full animate-pulse rounded-xl bg-white/5" />
    </aside>

    <aside v-else class="hidden h-full shrink-0 items-center justify-center border-l border-white/5 text-light-500/40 md:flex md:w-[400px] md:flex-col">
      <NuxtIcon name="local:folder" class="mb-3 text-4xl" />
      <p class="text-xs font-semi-bold">No coordinates found.</p>
    </aside>
  </main>
</template>
