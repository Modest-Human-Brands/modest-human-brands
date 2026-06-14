<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const activeConversationId = route.params.id as string

const { conversations, messages, inboxPending, chatPending, isPaginating, sendMessage, loadMoreMessages } = useCoordinate(activeConversationId)
</script>

<template>
  <main class="flex size-full overflow-hidden">
    <!-- Center Pane: Active Chat -->
    <div class="flex h-full min-w-0 flex-1 flex-col transition-all duration-300">
      <CoordinateChatArea :room-id="activeConversationId" :messages="messages" :pending="chatPending" :is-paginating="isPaginating" @send="sendMessage" @load-more="loadMoreMessages" />
    </div>

    <!-- Right Sidebar: Unified Inbox (Hidden on Mobile) -->
    <div class="hidden h-full shrink-0 border-l border-dark-500 transition-all duration-300 md:flex md:w-[400px]">
      <div v-if="inboxPending" class="size-full animate-pulse bg-white/5" />
      <CoordinateSidebar v-else-if="conversations" :conversations="conversations" :active-id="activeConversationId" />
    </div>
  </main>
</template>
