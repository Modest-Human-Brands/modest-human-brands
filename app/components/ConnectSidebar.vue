<script setup lang="ts">
const props = defineProps<{
  contacts: InboxContact[]
  activeContactId: string | null
}>()

const activeFilter = ref<ChannelType | 'all'>('all')
const filters: { label: string; value: ChannelType | 'all'; icon: string }[] = [
  { label: 'All', value: 'all', icon: 'local:kanban' },
  { label: 'Email', value: 'email', icon: 'local:email' },
  { label: 'Whatsapp', value: 'whatsapp', icon: 'local:whatsapp' },
  { label: 'Instagram', value: 'instagram', icon: 'local:instagram' },
  { label: 'SMS', value: 'sms', icon: 'local:chat' },
  { label: 'Phone', value: 'phone', icon: 'local:phone' },
]

const filteredContacts = computed(() => {
  if (activeFilter.value === 'all') return props.contacts
  return props.contacts.filter((c) => (activeFilter.value === 'all' ? true : c.availableChannels.includes(activeFilter.value) || c.activeChannel === activeFilter.value))
})
</script>

<template>
  <div class="flex h-full w-full flex-col border-l border-dark-500 bg-dark-400 md:w-[400px]">
    <div class="scrollbar-hidden flex shrink-0 items-center gap-2 overflow-x-auto p-2">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors"
        :class="[activeFilter === filter.value ? 'bg-dark-600 text-white' : 'bg-dark-500 text-light-500 hover:bg-dark-600 hover:text-white']"
        @click="activeFilter = filter.value">
        <NuxtIcon :name="filter.icon" class="text-sm" />
        {{ filter.label }}
      </button>
    </div>

    <div class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
      <ConnectContactCard v-for="contact in filteredContacts" :key="contact.id" :contact="contact" :is-active="contact.id === activeContactId" />
    </div>
  </div>
</template>
