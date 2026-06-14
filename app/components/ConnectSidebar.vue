<script setup lang="ts">
const props = defineProps<{
  activeId: string | null
  contacts: ChatContact[]
}>()

const activeTab = ref<ChannelType | 'all'>('all')
const tabs: { id: ChannelType | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'local:kanban' },
  { id: 'email', label: 'Email', icon: 'local:email' },
  { id: 'whatsapp', label: 'Whatsapp', icon: 'local:whatsapp' },
  { id: 'instagram', label: 'Instagram', icon: 'local:instagram' },
  { id: 'sms', label: 'SMS', icon: 'local:chat' },
  { id: 'phone', label: 'Phone', icon: 'local:phone' },
]

const filteredContacts = computed(() => {
  if (activeTab.value === 'all') return props.contacts
  return props.contacts.filter((c) => (activeTab.value === 'all' ? true : c.availableChannels.includes(activeTab.value) || c.activeChannel === activeTab.value))
})
</script>

<template>
  <div class="flex size-full flex-col border-l border-dark-500 bg-dark-400 md:w-[400px]">
    <div class="scrollbar-hidden flex shrink-0 items-center gap-2 overflow-x-auto p-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors"
        :class="[activeTab === tab.id ? 'bg-dark-600 text-white' : 'bg-dark-500 text-light-500 hover:bg-dark-600 hover:text-white']"
        @click="activeTab = tab.id">
        <NuxtIcon :name="tab.icon" class="text-sm" />
        {{ tab.label }}
      </button>
    </div>

    <div class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
      <ConnectContactCard v-for="contact in filteredContacts" :key="contact.id" :contact="contact" :is-active="contact.id === activeId" />
    </div>
  </div>
</template>
