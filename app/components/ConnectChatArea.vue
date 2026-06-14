<script setup lang="ts">
const props = defineProps<{
  activeContact: ChatContact | null
  messages: ChatMessage[]
}>()

const emit = defineEmits<{
  send: [payload: { text: string; channel: ChannelType }]
}>()

const activeChannel = ref<ChannelType>('whatsapp')
const channels = [
  { id: 'email', name: 'Email', icon: 'local:email' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'local:whatsapp' },
  { id: 'instagram', name: 'Instagram', icon: 'local:instagram' },
  { id: 'sms', name: 'SMS', icon: 'local:chat' },
  { id: 'phone', name: 'Phone', icon: 'local:phone' },
] as const

const channelCounts = computed(() => {
  const counts: Record<ChannelType, number> = {
    email: 0,
    whatsapp: 0,
    instagram: 0,
    sms: 0,
    phone: 0,
  }

  channels.forEach((ch) => {
    counts[ch.id] = 0
  })

  if (props.messages) {
    props.messages.forEach((msg) => {
      if (counts[msg.channel!] !== undefined) {
        counts[msg.channel!]++
      }
    })
  }
  return counts
})

const activeMessages = computed(() => {
  if (!props.messages) return []
  return props.messages.filter((msg) => {
    return msg.channel!.toLowerCase() === activeChannel.value
  })
})

const chatContainer = useTemplateRef('chatContainer')
const { y } = useScroll(chatContainer, { behavior: 'smooth' })

watch(
  activeMessages,
  async () => {
    await nextTick()
    if (chatContainer.value) {
      y.value = chatContainer.value.scrollHeight
    }
  },
  { deep: true, immediate: true }
)

function handleSend(text: string) {
  emit('send', { text, channel: activeChannel.value })
}
watch(
  () => props.activeContact,
  (newContact) => {
    if (newContact) {
      activeChannel.value = newContact.activeChannel || 'email'
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex h-full flex-1 flex-col bg-dark-400">
    <div v-if="!activeContact" class="flex h-full flex-col items-center justify-center gap-4 text-light-500">
      <NuxtIcon name="local:chat" class="mb-4 text-[64px] opacity-50" />
      <p class="text-lg">Select a conversation to start messaging</p>
    </div>

    <template v-else>
      <header class="flex shrink-0 flex-col gap-4 border-b border-dark-500 p-2 md:p-6">
        <div class="flex items-center gap-4">
          <div class="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-dark-500">
            {{ activeContact.initial }}
          </div>
          <div class="flex flex-col">
            <h2 class="text-lg font-bold text-white">{{ activeContact.name }}</h2>
            <span class="text-sm font-bold text-light-500">{{ activeContact.company }}</span>
          </div>
        </div>

        <div class="scrollbar-hidden flex shrink-0 items-center gap-2 overflow-x-auto">
          <button
            v-for="channel in channels"
            :key="channel.id"
            class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize transition-colors"
            :class="[activeChannel === channel.id ? 'bg-white fill-dark-500 text-dark-500' : 'bg-dark-500 fill-light-400 text-light-400 hover:bg-dark-600 hover:fill-white hover:text-white']"
            @click="activeChannel = channel.id as ChannelType">
            <NuxtIcon :name="channel.icon" class="text-sm" />
            <div class="flex items-center gap-1">
              {{ channel.name }}
              <span :class="activeChannel === channel.id ? 'opacity-70' : 'text-light-500 opacity-60'">({{ channelCounts[channel.id] }})</span>
            </div>
          </button>
        </div>
      </header>

      <div ref="chatContainer" class="flex-1 overflow-y-auto p-2 md:px-6 md:py-4">
        <ChatMessageBubble v-for="message in activeMessages" :key="message.id" :message="message" />
      </div>

      <div class="shrink-0 border-t border-dark-500">
        <ChatVoiceInput v-if="activeChannel === 'phone'" @start-call="console.log('Call started')" />
        <ChatMessageInput v-else @send="handleSend" />
      </div>
    </template>
  </div>
</template>
