<script setup lang="ts">
const props = defineProps<{
  activeId: string | null
  contacts: ChatContact[]
}>()

const isOpen = ref(true)
const activeChannel = ref<ChannelType | 'all'>('all')
const channels: { id: ChannelType | 'all'; name: string; icon: string }[] = [{ id: 'all', name: 'All', icon: 'local:kanban' }, ...CONNECT_CHANNELS]

const filteredContacts = computed(() => {
  if (activeChannel.value === 'all') return props.contacts
  return props.contacts.filter((c) => (activeChannel.value === 'all' ? true : c.availableChannels.includes(activeChannel.value) || c.activeChannel === activeChannel.value))
})
</script>

<template>
  <AppSidebar v-model:open="isOpen">
    <template #header>
      <div class="scrollbar-hidden -mx-2 flex shrink-0 items-center gap-2 overflow-x-auto px-2 pb-2 md:pb-0">
        <button
          v-for="channel in channels"
          :key="channel.id"
          class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semi-bold transition-colors"
          :class="[activeChannel === channel.id ? 'bg-dark-600 text-white' : 'bg-dark-500 text-light-500 hover:bg-dark-600 hover:text-white']"
          @click.stop="
            () => {
              activeChannel = channel.id
              isOpen = true
            }
          ">
          <NuxtIcon :name="channel.icon" class="text-[16px]" />
          {{ channel.name }}
        </button>
      </div>
    </template>

    <div class="flex flex-col gap-2 pt-2 md:pt-4">
      <ConnectContactCard v-for="contact in filteredContacts" :key="contact.id" :contact="contact" :is-active="contact.id === activeId" @click="isOpen = false" />

      <div v-if="filteredContacts.length === 0" class="mt-10 flex flex-col items-center text-light-500/40">
        <NuxtIcon name="local:chat" class="mb-2 text-2xl opacity-50" />
        <span class="text-xs font-semi-bold text-light-500">No contacts found</span>
      </div>
    </div>
  </AppSidebar>
</template>
