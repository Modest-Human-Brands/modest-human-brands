<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string

const { data: projectSummary } = await useFetch(`/api/drive/${projectId}`)

const activeTab = ref<'plan' | 'draft' | 'approved' | 'notApproved' | 'release' | 'archive'>('approved')
const currentPage = ref(1)
const selectedIds = ref(new Set<string>())
const isExporting = ref(false)
const isUploadStudioOpen = ref(false)

const {
  data: mediaRegistry,
  pending: isRegistryLoading,
  refresh,
} = await useFetch(`/api/drive/${projectId}/media`, {
  query: computed(() => ({ status: activeTab.value, page: currentPage.value, limit: 50, sort: 'date_desc' })),
})

const getCategorySum = (statusKey: 'plan' | 'draft' | 'approved' | 'notApproved' | 'release' | 'archive') => {
  const breakdown = projectSummary.value?.mediaSummary?.breakdown
  if (!breakdown) return 0
  return (breakdown.photo?.approval?.[statusKey] ?? 0) + (breakdown.video?.approval?.[statusKey] ?? 0) + (breakdown.audio?.approval?.[statusKey] ?? 0)
}

const tabs = computed(() => [
  { id: 'plan' as const, label: 'Planned', count: getCategorySum('plan') },
  { id: 'draft' as const, label: 'Pending Review', count: getCategorySum('draft') },
  { id: 'approved' as const, label: 'Approved', count: getCategorySum('approved') },
  { id: 'notApproved' as const, label: 'Not Approved', count: getCategorySum('notApproved') },
  { id: 'release' as const, label: 'Release', count: getCategorySum('release') },
  { id: 'archive' as const, label: 'Archive', count: getCategorySum('archive') },
])

function toggleSelection(mediaId: string) {
  if (selectedIds.value.has(mediaId)) selectedIds.value.delete(mediaId)
  else selectedIds.value.add(mediaId)
}

async function executeBulkRPC(actionKind: 'approve' | 'delete' | 'move', statusParam?: string) {
  if (!selectedIds.value.size) return
  try {
    await $fetch('/api/media/action', {
      method: 'POST',
      body: {
        action: actionKind,
        mediaIds: Array.from(selectedIds.value),
        params: statusParam ? { status: statusParam } : undefined,
      },
    })
    selectedIds.value.clear()
    await refresh()
  } catch (err) {
    console.error('[BulkRPC Failure]:', err)
  }
}

async function triggerProjectZIP() {
  isExporting.value = true
  try {
    const res = await $fetch('/api/media/downloads', {
      method: 'POST',
      body: { projectId, params: { status: activeTab.value } },
    })
    const targetUrl = res?.data?.assets?.[0]?.downloadUrl || res?.assets?.[0]?.downloadUrl
    if (targetUrl) window.open(targetUrl, '_blank')
  } finally {
    isExporting.value = false
  }
}

const { y } = useWindowScroll()
const isHeaderCollapsed = computed(() => y.value > 50)
</script>

<template>
  <div class="flex min-h-screen select-none flex-col bg-dark-400 pb-32 font-main text-white">
    <div class="relative shrink-0 overflow-hidden border-b border-white/5 bg-dark-500/20 transition-all duration-500 ease-in-out" :class="isHeaderCollapsed ? 'h-16' : 'h-64'">
      <div class="absolute inset-0 z-10 bg-gradient-to-t from-dark-400 via-dark-400/40 to-transparent" />

      <div class="relative z-20 mx-auto flex h-full w-full items-end justify-between px-4 pb-4 md:px-8 md:pb-6">
        <div>
          <h1 class="font-semi-bold tracking-tight transition-all duration-300" :class="isHeaderCollapsed ? 'tex-base md:text-xl' : 'text-lg md:text-2xl'">
            {{ projectSummary?.name ?? projectId }}
          </h1>
          <p v-if="!isHeaderCollapsed" class="font-mono mt-2 text-xs text-light-500">
            Vault Footprint: {{ projectSummary?.mediaSummary?.totals?.humanReadableStorage }} · Total Assets:
            {{ projectSummary?.mediaSummary?.totals?.count }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 rounded-xl bg-primary-500/80 px-4 py-2 text-xs font-semi-bold text-white shadow-lg hover:bg-primary-500" @click="isUploadStudioOpen = true">
            <NuxtIcon name="local:upload" class="text-lg md:text-base" />
            <span class="hidden md:inline">Upload Assets</span>
          </button>
          <button
            :disabled="isExporting"
            class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semi-bold transition-colors hover:bg-white/10"
            @click="triggerProjectZIP">
            <NuxtIcon name="local:download" class="text-lg md:text-base" />
            <span class="hidden md:inline">{{ isExporting ? 'Packaging...' : 'Export View ZIP' }}</span>
          </button>
        </div>
      </div>
    </div>

    <nav class="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-dark-400/90 py-2 backdrop-blur-md md:px-3">
      <div class="scrollbar-hidden flex gap-2 overflow-x-auto pr-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="shrink-0 rounded-full px-4 py-1.5 text-xs font-semi-bold transition-all"
          :class="activeTab === tab.id ? 'bg-primary-500 text-white shadow-md' : 'text-light-500 hover:bg-white/5 hover:text-white'"
          @click="
            () => {
              activeTab = tab.id
              currentPage = 1
            }
          ">
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <div class="font-mono shrink-0 text-xs text-light-500">Page {{ currentPage }}</div>
    </nav>

    <main class="mx-auto w-full grow pt-1">
      <div v-if="isRegistryLoading" class="grid grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6">
        <div v-for="i in 18" :key="i" class="aspect-square animate-pulse rounded-xl bg-white/5" />
      </div>

      <div v-else-if="mediaRegistry?.data?.length" class="grid grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6">
        <CardMedia v-for="item in mediaRegistry.data" :key="item.id" :project-id="projectId" :media="item" :selected="selectedIds.has(item.id)" @select="toggleSelection(item.id)" />
      </div>

      <div v-else class="my-32 flex flex-col items-center justify-center text-light-500/40">
        <NuxtIcon name="local:photo" class="mb-2 text-5xl" />
        <p class="text-sm font-semi-bold">No assets populated in this filter view</p>
      </div>
    </main>

    <ModalUploadStudio v-model:open="isUploadStudioOpen" :project-id="projectId" @refresh="refresh" />

    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-if="selectedIds.size"
          class="fixed bottom-4 left-1/2 z-50 flex w-[90vw] -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/15 bg-dark-500/95 px-4 py-3.5 font-main text-xs text-white shadow-2xl backdrop-blur-xl md:bottom-8 md:w-auto md:flex-nowrap md:gap-4 md:px-6">
          <div class="flex items-center gap-2 font-semi-bold md:border-r md:border-white/10 md:pr-3">
            <span class="flex size-5 items-center justify-center rounded-full bg-primary-500 text-[11px]">{{ selectedIds.size }}</span>
            <span>Selected</span>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto">
            <button
              class="rounded-lg border border-success-500/30 bg-success-600/20 px-3 py-1.5 font-semi-bold text-success-400 transition-all hover:bg-success-500 hover:text-black"
              @click="executeBulkRPC('approve', 'approved')">
              Approve
            </button>

            <button
              class="rounded-lg border border-warning-500/30 bg-warning-600/20 px-3 py-1.5 font-semi-bold text-warning-400 transition-all hover:bg-warning-500 hover:text-black"
              @click="executeBulkRPC('approve', 'notApproved')">
              Reject
            </button>

            <button
              class="rounded-lg border border-alert-500/30 bg-alert-600/20 px-3 py-1.5 font-semi-bold text-alert-400 transition-all hover:bg-alert-500 hover:text-white"
              @click="executeBulkRPC('delete')">
              Trash
            </button>
          </div>

          <button class="pl-2 pr-1 text-light-500 transition-colors hover:text-white md:ml-2 md:pl-0" @click="selectedIds.clear()">Deselect</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
