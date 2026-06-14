<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: rawContacts, pending: loadingContacts } = await useFetch('/api/connect')

const contacts = computed<ChatContact[]>(() => {
  if (!rawContacts.value) return []
  return rawContacts.value.map((c) => ({
    id: c.id,
    name: c.name,
    initial: c.initial,
    company: c.company,
    lastActive: c.lastActive,
    lastMessageSnippet: c.lastMessageSnippet,
    activeChannel: (c.platforms[0] || 'email') as ChannelType,
    availableChannels: c.platforms as ChannelType[],
  }))
})
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
