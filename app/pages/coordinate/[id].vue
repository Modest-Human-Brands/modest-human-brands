<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const activeConversationId = route.params.id as string

const { conversations, messages, pending, chatPending, isPaginating, sendMessage, loadMoreMessages } = useCoordinate(activeConversationId)
</script>

<template>
  <main class="relative flex size-full overflow-hidden">
    <div class="flex h-full min-w-0 flex-1 flex-col transition-all duration-300">
      <CoordinateChatArea :room-id="activeConversationId" :messages="messages" :pending="chatPending" :is-paginating="isPaginating" @send="sendMessage" @load-more="loadMoreMessages" />
    </div>

    <CoordinateSidebar v-if="conversations && !pending" :conversations="conversations" :active-id="activeConversationId" />

    <div v-else-if="pending" class="hidden h-full w-[400px] shrink-0 animate-pulse border-l border-dark-500 bg-white/5 md:block" />
  </main>
</template>
