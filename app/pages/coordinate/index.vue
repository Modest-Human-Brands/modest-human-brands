<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { conversations, inboxPending } = useCoordinate()
</script>

<template>
  <main class="flex size-full overflow-hidden">
    <!-- Center Pane: Empty State -->
    <div class="flex h-full min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300">
      <div class="hidden h-full flex-col items-center justify-center md:flex">
        <div class="flex flex-col items-center gap-4 text-white/80">
          <NuxtIcon name="local:email" class="mb-4 text-[64px] opacity-50" />
          <p class="text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    </div>

    <!-- Right Sidebar: Unified Inbox -->
    <div class="flex size-full shrink-0 border-l border-dark-500 transition-all duration-300 md:w-[400px]">
      <div v-if="inboxPending" class="size-full animate-pulse bg-dark-400" />
      <CoordinateSidebar v-else-if="conversations" :conversations="conversations" :active-id="null" />
    </div>
  </main>
</template>
