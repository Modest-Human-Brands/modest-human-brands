<script setup lang="ts">
const props = defineProps<{
  activeId: string | null
  contacts: ChatContact[]
}>()

const activeChannel = ref<ChannelType | 'all'>('all')
const channels: { id: ChannelType | 'all'; name: string; icon: string }[] = [{ id: 'all', name: 'All', icon: 'local:kanban' }, ...CONNECT_CHANNELS]

const filteredContacts = computed(() => {
  if (activeChannel.value === 'all') return props.contacts
  return props.contacts.filter((c) => (activeChannel.value === 'all' ? true : c.availableChannels.includes(activeChannel.value) || c.activeChannel === activeChannel.value))
})
</script>

<template>
  <div class="flex size-full flex-col border-l border-dark-500 bg-dark-400 md:w-[400px]">
    <div class="scrollbar-hidden flex shrink-0 items-center gap-2 overflow-x-auto p-2">
      <button
        v-for="channel in channels"
        :key="channel.id"
        class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors"
        :class="[activeChannel === channel.id ? 'bg-dark-600 text-white' : 'bg-dark-500 text-light-500 hover:bg-dark-600 hover:text-white']"
        @click="activeChannel = channel.id">
        <NuxtIcon :name="channel.icon" class="text-[16px]" />
        {{ channel.name }}
      </button>
    </div>

    <div class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
      <ConnectContactCard v-for="contact in filteredContacts" :key="contact.id" :contact="contact" :is-active="contact.id === activeId" />
    </div>
  </div>
</template>
