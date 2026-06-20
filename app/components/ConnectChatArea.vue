<script setup lang="ts">
export interface SendMessagePayload {
  content: string
  channel: ChannelType
  template?: string
  variables?: Record<string, unknown>
}

const props = defineProps<{
  activeContact: ChatContact | null
  messages: ChatMessage[]
  templates?: {
    id: string
    variables: Record<string, string | Record<string, unknown>>
  }[]
}>()

const emit = defineEmits<{
  send: [payload: SendMessagePayload]
}>()

const activeChannel = ref<ChannelType>('email')
const isActionsOpen = ref(false)
const drawerRef = useTemplateRef('drawerRef')

const channelCounts = computed(() => {
  const counts: Record<ChannelType, number> = {
    email: 0,
    whatsapp: 0,
    instagram: 0,
    sms: 0,
    phone: 0,
  }

  CONNECT_CHANNELS.forEach((ch) => {
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
  if (isActionsOpen.value && drawerRef.value?.hasSelection) {
    const success = drawerRef.value.submit()
    if (success) isActionsOpen.value = false
    return
  }

  if (text.trim()) {
    emit('send', { content: text, channel: activeChannel.value })
  }
}

function handleToggleActions() {
  if (activeChannel.value === 'email') {
    isActionsOpen.value = !isActionsOpen.value
  } else {
    alert('Templates are currently only supported for Email.')
  }
}

function handleTemplateSubmit(payload: { templateId: string; variables: Record<string, unknown> }) {
  emit('send', {
    content: `[Dispatched Template: ${payload.templateId.replace(/-/g, ' ')}]`,
    channel: 'email',
    template: payload.templateId,
    variables: payload.variables,
  })
}

watch(
  () => props.activeContact,
  (newContact) => {
    if (newContact) {
      activeChannel.value = newContact.activeChannel || 'email'
      isActionsOpen.value = false
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
          <div class="font-semibold flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-xl text-dark-500">
            {{ activeContact.initial }}
          </div>
          <div class="flex flex-col">
            <h2 class="font-semibold text-lg text-white">{{ activeContact.name }}</h2>
            <span class="font-semibold text-sm text-light-500">{{ activeContact.company }}</span>
          </div>
        </div>

        <div class="scrollbar-hidden flex shrink-0 items-center gap-2 overflow-x-auto">
          <button
            v-for="channel in CONNECT_CHANNELS"
            :key="channel.id"
            class="font-semibold flex items-center gap-2 rounded-full px-4 py-2 text-sm capitalize transition-colors"
            :class="[activeChannel === channel.id ? 'bg-white fill-dark-500 text-dark-500' : 'bg-dark-500 fill-light-400 text-light-400 hover:bg-dark-600 hover:fill-white hover:text-white']"
            @click="activeChannel = channel.id">
            <NuxtIcon :name="channel.icon" class="text-[16px]" />
            <div class="flex items-center gap-1">
              {{ channel.name }}
              <span :class="activeChannel === channel.id ? 'opacity-70' : 'text-light-500 opacity-60'">({{ channelCounts[channel.id] }})</span>
            </div>
          </button>
        </div>
      </header>

      <div ref="chatContainer" class="scrollbar-hidden flex-1 overflow-y-auto p-3 md:px-6 md:py-4">
        <ChatMessageBubble v-for="message in activeMessages" :key="message.id" :message="message" />
      </div>

      <div v-if="templates" class="relative z-20 flex shrink-0 flex-col border-t border-dark-500 bg-dark-400">
        <div class="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" :class="isActionsOpen ? 'grid-rows-1' : 'grid-rows-[0fr]'">
          <div class="overflow-hidden">
            <ConnectActionDrawer ref="drawerRef" :templates="templates" @submit="handleTemplateSubmit" @close="isActionsOpen = false" />
          </div>
        </div>

        <ChatVoiceInput v-if="activeChannel === 'phone'" @start-call="console.log('Call started')" />
        <ChatMessageInput v-else :is-actions-open="isActionsOpen" @send="handleSend" @open-actions="handleToggleActions" />
      </div>
    </template>
  </div>
</template>
