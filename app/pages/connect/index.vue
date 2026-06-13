<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: rawContacts, pending: loadingContacts } = await useFetch<UIConnectCard[]>('/api/connect')

const contacts = computed<InboxContact[]>(() => {
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
  <main class="flex h-full w-full overflow-hidden">
    <div class="hidden h-full min-w-0 flex-1 flex-col transition-all duration-300 md:flex">
      <ChatArea :active-contact="null" :messages="[]" />
    </div>

    <div class="flex h-full w-full shrink-0 border-l border-dark-500 transition-all duration-300 md:flex md:w-[400px]">
      <div v-if="loadingContacts" class="h-full w-full animate-pulse bg-white/5" />

      <ConnectSidebar v-else :contacts="contacts" :active-contact-id="null" />
    </div>
  </main>
</template>
