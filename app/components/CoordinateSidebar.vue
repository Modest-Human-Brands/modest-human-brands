<script setup lang="ts">
const props = defineProps<{
  activeId: string | null
  conversations: CoordinateConversation[]
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const activeTab = ref<'people' | 'projects' | 'topics'>('people')

const TABS: { id: 'people' | 'projects' | 'topics'; label: string; icon: string }[] = [
  { id: 'people', label: 'People', icon: 'local:person' },
  { id: 'projects', label: 'Projects', icon: 'local:kanban' },
  { id: 'topics', label: 'Topics', icon: 'local:document' },
]

const filteredConversations = computed(() => {
  return props.conversations.filter((c) => c.type === activeTab.value)
})
</script>

<template>
  <div class="flex size-full flex-col border-l border-dark-500 bg-dark-400 md:w-[400px]">
    <div class="scrollbar-hidden flex shrink-0 items-center gap-2 overflow-x-auto p-2">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="font-semibold flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors"
        :class="[activeTab === tab.id ? 'bg-dark-600 text-white' : 'bg-dark-500 text-light-500 hover:bg-dark-600 hover:text-white']"
        @click="activeTab = tab.id">
        <NuxtIcon :name="tab.icon" class="text-sm" />
        {{ tab.label }}
      </button>
    </div>
    <div class="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
      <CoordinateContactCard v-for="conv in filteredConversations" :key="conv.id" :conversation="conv" :is-active="conv.id === activeId" @click="emit('select', conv.id)" />
      <div v-if="filteredConversations.length === 0" class="mt-10 flex flex-col items-center text-light-500">
        <NuxtIcon name="local:chat" class="mb-2 text-2xl opacity-50" />
        <span class="font-semibold text-xs">No {{ activeTab }} found</span>
      </div>
    </div>
  </div>
</template>
