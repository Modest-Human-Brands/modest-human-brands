<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { isConnected, selectRoom } = useChat()

const router = useRouter()

function onSelectRoom(id: string) {
  selectRoom(id)
  router.push(`/coordinate/${id}`)
}
</script>

<template>
  <div class="mt-2 flex h-full overflow-hidden border-t border-white/10 md:mt-2.5">
    <div class="flex min-h-[60vh] w-0 flex-col items-center justify-center overflow-hidden text-center md:w-full">
      <p class="mt-3 text-sm uppercase tracking-widest text-light-500">User is {{ isConnected ? 'Connected' : 'Disconnected' }}</p>
      <p class="mt-3 text-sm uppercase tracking-widest text-light-500">Select a room to get started</p>
    </div>
    <ChatSidebar @select-room="onSelectRoom" />
  </div>
</template>
