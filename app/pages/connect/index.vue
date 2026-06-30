<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: contacts, pending } = await useFetch('/api/connect', { default: () => [] as ChatContact[] })
</script>

<template>
  <main class="flex size-full select-none overflow-hidden bg-dark-400">
    <div class="hidden h-full min-w-0 flex-1 flex-col md:flex">
      <ConnectChatArea :active-contact="null" :messages="[]" />
    </div>

    <aside class="flex size-full shrink-0 border-l border-white/5 md:max-w-[400px]">
      <div v-if="pending" class="flex size-full flex-col gap-2.5 p-4">
        <div v-for="i in 8" :key="i" class="h-16 w-full animate-pulse rounded-xl bg-white/5" />
      </div>

      <ConnectSidebar v-else-if="contacts?.length" :contacts="contacts" :active-id="null" class="size-full" />

      <div v-else class="my-auto flex w-full flex-col items-center justify-center text-light-500/40">
        <NuxtIcon name="local:folder" class="mb-3 text-4xl" />
        <p class="text-xs font-semi-bold">No connects found.</p>
      </div>
    </aside>
  </main>
</template>
