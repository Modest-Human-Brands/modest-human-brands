<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const chips = [
  { id: 'mail', label: 'Mail', icon: 'local:kanban' },
  { id: 'meet', label: 'Meet', icon: 'local:kanban' },
]

const { data: messages, pending } = await useFetch('/api/connect', { default: () => [] })

const activeMessageId = ref(messages.value[0]?.id)

watch(
  messages,
  (newMessages) => {
    if (!activeMessageId.value && newMessages.length > 0) {
      activeMessageId.value = newMessages[0]!.id
    }
  },
  { immediate: true }
)

const activeMessageIndex = computed(() => messages.value.findIndex((m) => m.id === activeMessageId.value))

const activePreview = computed(() => {
  if (!messages.value.length || activeMessageIndex.value === -1) return null

  return {
    ...messages.value[activeMessageIndex.value],
    senderAvatarUrl: messages.value[activeMessageIndex.value]!.avatarUrl,
    currentIndex: activeMessageIndex.value + 1,
    totalCount: messages.value.length,
  }
})

const setNextMessage = () => {
  if (activeMessageIndex.value < messages.value.length - 1) {
    activeMessageId.value = messages.value[activeMessageIndex.value + 1]!.id
  }
}

const setPrevMessage = () => {
  if (activeMessageIndex.value > 0) {
    activeMessageId.value = messages.value[activeMessageIndex.value - 1]!.id
  }
}
</script>

<template>
  <div class="flex size-full min-h-0 gap-6 overflow-hidden px-2 pb-4 md:px-4">
    <aside class="flex w-full max-w-[360px] flex-col gap-4 overflow-hidden">
      <div class="flex items-center gap-2">
        <ConnectChip v-for="chip in chips" :key="chip.id" :label="chip.label" :icon="chip.icon" :is-active="chip.id === 'mail'" />
      </div>

      <div v-if="pending" class="flex size-full flex-col gap-2.5">
        <div v-for="i in 8" :key="i" class="h-24 w-full animate-pulse rounded-xl bg-white/5" />
      </div>

      <div v-else-if="messages?.length" class="scrollbar-hidden flex flex-col gap-3 overflow-y-auto pb-4">
        <ContactCardMessage v-for="msg in messages" :key="msg.id" v-bind="msg" :is-active="msg.id === activeMessageId" @click="activeMessageId = msg.id" />
      </div>

      <div v-else class="my-auto flex w-full flex-col items-center justify-center text-light-500/40">
        <NuxtIcon name="local:folder" class="mb-3 text-4xl" />
        <p class="text-xs font-semi-bold">No connects found.</p>
      </div>
    </aside>

    <ConnectPreviewPanel v-if="activePreview" v-bind="activePreview" @next="setNextMessage" @prev="setPrevMessage" />
    <div v-else class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-2xl bg-dark-500/20" />
  </div>
</template>
