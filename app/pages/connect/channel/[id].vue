<script setup lang="ts">
import type { SendMessagePayload } from '~/components/ConnectChatArea.vue'

definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const activeContactId = String(route.params.id)

const { data: contacts, pending: loadingContacts } = await useFetch('/api/connect')
const activeContact = computed(() => contacts.value?.find((c) => c.id === activeContactId) || null)

const { data: timeline, pending: loadingTimeline } = await useFetch(`/api/connect/${activeContactId}/timeline`)
const { data: emailTemplates } = await useFetch('/api/connect/text/email/template')

const messages = computed<ChatMessage[]>(() => {
  if (!timeline.value) return []

  return timeline.value
    .map((msg) => ({
      ...msg,
      senderName: msg.isOwn ? 'Me' : activeContact.value?.name || 'Client',
      senderInitial: msg.isOwn ? 'M' : activeContact.value?.initial || 'C',
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
})

async function handleSendMessage({ content, channel, template, variables }: SendMessagePayload) {
  const tempId = `temp-${Date.now()}`

  if (timeline.value) {
    timeline.value.push({
      id: tempId,
      content: content,
      time: new Date().toISOString(),
      isOwn: true,
      channel,
      status: 'sending',
      metadata: {
        subject: template ? `Template: ${template.replace(/-/g, ' ')}` : 'New Message',
      },
    })
  }

  try {
    const body: Record<string, unknown> = {
      contactId: activeContactId,
      orgId: 'modest-human-brands',
    }

    if (template && variables) {
      body.template = template
      body.variables = variables
    } else {
      body.template = 'none'
      body.text = content
      body.subject = 'New Message'
    }

    await $fetch(`/api/connect/text/${channel}/send`, {
      method: 'POST',
      body,
    })

    if (timeline.value) {
      const msg = timeline.value.find((m) => m.id === tempId)
      if (msg) msg.status = 'sent'
    }
  } catch (error) {
    console.error(`Failed to send ${channel} message:`, error)
    if (timeline.value) {
      const msg = timeline.value.find((m) => m.id === tempId)
      if (msg) msg.status = 'error'
    }
  }
}
</script>

<template>
  <main class="flex size-full overflow-hidden">
    <div class="relative flex h-full min-w-0 flex-1 flex-col transition-all duration-300">
      <div v-if="loadingTimeline && messages.length === 0" class="flex h-full items-center justify-center text-white/40">
        <div class="flex animate-pulse flex-col items-center gap-3">
          <NuxtIcon name="local:chat" class="text-3xl" />
          <span class="text-sm font-bold uppercase tracking-widest">Synchronizing Ledger...</span>
        </div>
      </div>

      <ConnectChatArea v-else class="min-h-0 flex-1" :active-contact="activeContact" :messages="messages" :templates="emailTemplates || []" @send="handleSendMessage" />
    </div>

    <div class="hidden h-full shrink-0 border-l border-dark-500 transition-all duration-300 md:flex md:w-[400px]">
      <div v-if="loadingContacts" class="size-full animate-pulse bg-white/5" />
      <ConnectSidebar v-else :contacts="contacts || []" :active-id="activeContactId" />
    </div>
  </main>
</template>
