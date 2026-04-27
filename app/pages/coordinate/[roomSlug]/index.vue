<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { selectRoom } = useChat()

const router = useRouter()

function onSelectRoom(id: string) {
  selectRoom(id)
  router.push(`/coordinate/${id}`)
}
</script>

<template>
  <section class="mt-2 flex h-full overflow-hidden border-t border-white/10 md:mt-2.5">
    <!-- Empty state -->
    <div class="flex w-full min-w-0 flex-col">
      <ChatChannelHeader />
      <div class="relative mx-auto flex w-full max-w-3xl grow flex-col overflow-hidden">
        <ClientOnly>
          <ChatMessageList />
          <ChatMessageInput />
        </ClientOnly>
      </div>
    </div>
    <ChatSidebar class="hidden md:flex" @select-room="onSelectRoom" />
    <ChatRoomDetailsPanel />
  </section>
</template>
