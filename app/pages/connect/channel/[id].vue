<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const activeContactId = route.params.id as string

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

const activeContact = computed(() => contacts.value.find((c) => c.id === activeContactId) || null)

const { data: timeline, pending: loadingTimeline } = await useFetch<UIConnectTimeline>(`/api/connect/${activeContactId}/timeline`)

const messages = computed<InboxMessage[]>(() => {
  if (!timeline.value) return []

  return timeline.value.interactions
    .map((msg) => ({
      id: msg.id,
      text: msg.summary,
      senderName: msg.direction === 'inbound' ? activeContact.value?.name || 'Client' : 'Me',
      senderInitial: msg.direction === 'inbound' ? activeContact.value?.initial || 'C' : 'M',
      time: msg.timestamp,
      isOwn: msg.direction === 'outbound',
      channel: msg.channel,
      status: msg.status || 'sent',
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
})

async function handleSendMessage({ text, channel }: { text: string; channel: ChannelType }) {
  const tempId = `temp-${Date.now()}`

  if (timeline.value) {
    timeline.value = {
      ...timeline.value,
      interactions: [
        ...timeline.value.interactions,
        {
          id: tempId,
          summary: text,
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          channel,
          status: 'sending',
        },
      ],
    }
  }

  try {
    await $fetch(`/api/connect/text/${channel}/send`, {
      method: 'POST',
      body: { contactId: activeContactId, subject: 'New Message', text },
    })

    if (timeline.value) {
      timeline.value = {
        ...timeline.value,
        interactions: timeline.value.interactions.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m)),
      }
    }
  } catch (error) {
    console.error(`Failed to send ${channel} message:`, error)

    if (timeline.value) {
      timeline.value = {
        ...timeline.value,
        interactions: timeline.value.interactions.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)),
      }
    }
  }
}
</script>

<template>
  <main class="flex h-full w-full overflow-hidden">
    <div class="flex h-full min-w-0 flex-1 flex-col transition-all duration-300">
      <div v-if="loadingTimeline && messages.length === 0" class="flex h-full items-center justify-center text-white/40">
        <div class="flex animate-pulse flex-col items-center gap-3">
          <NuxtIcon name="local:chat" class="text-3xl" />
          <span class="text-sm font-bold uppercase tracking-widest">Synchronizing Ledger...</span>
        </div>
      </div>
      <ChatArea v-else :active-contact="activeContact" :messages="messages" @send="handleSendMessage" />
    </div>
    <div class="hidden h-full shrink-0 border-l border-dark-500 transition-all duration-300 md:flex md:w-[400px]">
      <div v-if="loadingContacts" class="h-full w-full animate-pulse bg-white/5" />
      <ConnectSidebar v-else :contacts="contacts" :active-contact-id="activeContactId" />
    </div>
  </main>
</template>
