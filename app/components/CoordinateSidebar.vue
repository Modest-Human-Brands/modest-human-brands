<script setup lang="ts">
const props = defineProps<{
  activeId: string | null
  conversations: CoordinateConversation[]
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const isOpen = ref(false)
const activeTab = ref<'people' | 'projects' | 'topics'>('people')

const TABS = [
  { id: 'people', label: 'People', icon: 'local:person' },
  { id: 'projects', label: 'Projects', icon: 'local:kanban' },
  { id: 'topics', label: 'Topics', icon: 'local:document' },
] as const

const filteredConversations = computed(() => {
  return props.conversations.filter((c) => c.type === activeTab.value)
})
</script>

<template>
  <AppSidebar v-model="isOpen">
    <template #header>
      <div class="scrollbar-hidden mb-2 flex shrink-0 items-center gap-2 overflow-x-auto">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          class="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semi-bold transition-colors"
          :class="[activeTab === tab.id ? 'bg-dark-600 text-white' : 'bg-dark-500 text-light-500 hover:bg-dark-600 hover:text-white']"
          @click.stop="
            activeTab = tab.id
            isOpen = true
          ">
          <NuxtIcon :name="tab.icon" class="text-sm" />
          {{ tab.label }}
        </button>
      </div>
    </template>

    <div class="flex flex-col gap-2">
      <CoordinateContactCard
        v-for="conv in filteredConversations"
        :key="conv.id"
        :conversation="conv"
        :is-active="conv.id === activeId"
        @click="
          emit('select', conv.id)
          isOpen = false
        " />

      <div v-if="filteredConversations.length === 0" class="mt-10 flex flex-col items-center text-light-500">
        <NuxtIcon name="local:chat" class="mb-2 text-2xl opacity-50" />
        <span class="text-xs font-semi-bold">No {{ activeTab }} found</span>
      </div>
    </div>
  </AppSidebar>
</template>
