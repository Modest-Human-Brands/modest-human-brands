<script setup lang="ts">
const props = defineProps<{
  roomId: string
  messages: ChatMessage[]
  pending: boolean
  isPaginating?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'load-more'): void
}>()

const chatContainer = useTemplateRef('chatContainer')
const { y, arrivedState } = useScroll(chatContainer, { behavior: 'smooth' })

let previousScrollHeight = 0

watch(
  () => arrivedState.top,
  (isAtTop) => {
    if (isAtTop && !props.pending && !props.isPaginating && chatContainer.value) {
      previousScrollHeight = chatContainer.value.scrollHeight
      emit('load-more')
    }
  }
)

watch(
  () => props.messages.length,
  async (newLen, oldLen) => {
    await nextTick()
    if (chatContainer.value) {
      if (oldLen === 0 || props.pending) {
        y.value = chatContainer.value.scrollHeight
      } else if (previousScrollHeight > 0) {
        y.value = chatContainer.value.scrollHeight - previousScrollHeight
        previousScrollHeight = 0
      } else {
        y.value = chatContainer.value.scrollHeight
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex h-full min-w-0 flex-1 flex-col bg-dark-400">
    <header class="flex shrink-0 items-center justify-between border-b border-dark-500 bg-dark-400 p-4 md:px-6 md:py-5">
      <div class="flex items-center gap-4">
        <div class="flex flex-col">
          <h2 class="text-base font-semi-bold text-white">Project Chat: {{ roomId }}</h2>
          <span class="text-xs font-semi-bold text-light-500">Encrypted Matrix Room</span>
        </div>
      </div>
    </header>

    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6">
      <div v-if="isPaginating" class="mb-6 flex justify-center">
        <NuxtIcon name="local:hour" class="animate-spin text-xl text-light-500 opacity-50" />
      </div>

      <div v-if="pending" class="flex flex-col gap-4">
        <div v-for="i in 3" :key="i" class="h-16 w-2/3 animate-pulse rounded-xl bg-dark-500"></div>
      </div>

      <div v-else class="flex flex-col gap-6">
        <ChatMessageBubble v-for="message in messages" :key="message.id" :message="message" />
      </div>
    </div>

    <div class="shrink-0 border-t border-dark-500 bg-dark-400">
      <ChatMessageInput @send="(text) => emit('send', text)" />
    </div>
  </div>
</template>
