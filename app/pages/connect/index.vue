<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: contacts, pending: loadingContacts } = await useFetch('/api/connect', { default: () => [] as ChatContact[] })
</script>

<template>
  <main class="flex size-full overflow-hidden">
    <div class="hidden h-full min-w-0 flex-1 flex-col transition-all duration-300 md:flex">
      <ConnectChatArea :active-contact="null" :messages="[]" />
    </div>

    <div class="flex size-full shrink-0 border-l border-dark-500 transition-all duration-300 md:flex md:w-[400px]">
      <div v-if="loadingContacts" class="size-full animate-pulse bg-white/5" />
      <ConnectSidebar v-else :contacts="contacts" :active-id="null" />
    </div>
  </main>
</template>
