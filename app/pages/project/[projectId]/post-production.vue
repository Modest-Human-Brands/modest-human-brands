<script setup lang="ts">
definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

type MediaStatus = 'pending' | 'approved' | 'notApproved' | 'release'

const PAGE_SIZE = 50

const route = useRoute()
const projectId = route.params.projectId as string

const activeTab = ref<MediaStatus>('approved')
const currentPage = ref(1)

const { data: projectSummary } = await useFetch(`/api/drive/${projectId}`)

const { data: mediaRegistry, pending } = await useFetch(`/api/drive/${projectId}/media`, {
  query: computed(() => ({ status: activeTab.value, page: currentPage.value, limit: PAGE_SIZE, sort: 'date_desc' })),
})

function getCategorySum(statusKey: MediaStatus) {
  const breakdown = projectSummary.value?.mediaSummary?.breakdown as Record<string, { approval?: Record<string, number> }> | undefined
  if (!breakdown) return 0
  return (breakdown.photo?.approval?.[statusKey] ?? 0) + (breakdown.video?.approval?.[statusKey] ?? 0) + (breakdown.audio?.approval?.[statusKey] ?? 0)
}

const tabs = computed(() => [
  { id: 'pending' as const, label: 'Review', count: getCategorySum('pending') },
  { id: 'approved' as const, label: 'Approved', count: getCategorySum('approved') },
  { id: 'notApproved' as const, label: 'Not Approved', count: getCategorySum('notApproved') },
  { id: 'release' as const, label: 'Release', count: getCategorySum('release') },
])

const totalPages = computed(() => Math.max(1, Math.ceil((mediaRegistry.value?.totalItems ?? 0) / PAGE_SIZE)))

function selectTab(id: MediaStatus) {
  activeTab.value = id
  currentPage.value = 1
}
</script>

<template>
  <div class="scrollbar-hidden flex min-h-0 grow flex-col overflow-y-auto">
    <nav class="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-dark-400/90 px-4 py-2 backdrop-blur-md md:px-8">
      <div class="scrollbar-hidden flex gap-2 overflow-x-auto pr-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="shrink-0 rounded-full px-4 py-1.5 text-xs font-semi-bold transition-all"
          :class="activeTab === tab.id ? 'bg-accent-500 text-white shadow-md' : 'text-light-500 hover:bg-white/5 hover:text-white'"
          @click="selectTab(tab.id)">
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <div v-if="totalPages > 1" class="flex shrink-0 items-center gap-2 text-xs text-light-500">
        <button type="button" class="rounded-full px-2 py-1 hover:bg-white/5 hover:text-white disabled:opacity-30" :disabled="currentPage <= 1" @click="currentPage -= 1">Prev</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" class="rounded-full px-2 py-1 hover:bg-white/5 hover:text-white disabled:opacity-30" :disabled="currentPage >= totalPages" @click="currentPage += 1">Next</button>
      </div>
    </nav>

    <main class="w-full grow pt-1">
      <div v-if="pending" class="grid grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6">
        <div v-for="i in 12" :key="i" class="aspect-square animate-pulse rounded-xl bg-white/5" />
      </div>

      <div v-else-if="mediaRegistry?.data?.length" class="grid grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6">
        <CardMedia v-for="item in mediaRegistry.data" :key="item.id" :project-id="projectId" :media="item" />
      </div>

      <div v-else class="my-32 flex flex-col items-center justify-center text-light-500/40">
        <NuxtIcon name="local:photo" class="mb-2 text-5xl" />
        <p class="text-sm font-semi-bold">No media in this state yet</p>
      </div>
    </main>
  </div>
</template>
