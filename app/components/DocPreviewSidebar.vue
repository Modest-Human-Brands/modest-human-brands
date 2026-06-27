<script setup lang="ts">
export interface DocumentDetail {
  id: string
  name: string
  sizeBytes: number
  extension: string
  uploadedBy?: { name: string; avatar?: string }
  uploadedAt: string
  project?: string
  source?: string
  previewUrl?: string
  openedAt?: string
  filePath?: string
}

defineProps<{ document: DocumentDetail | null }>()

interface SidebarAction {
  id: string
  label: string
  icon: string
}

const sidebarActions: readonly SidebarAction[] = [
  { id: 'comment', label: 'Add comments', icon: 'local:chat' },
  { id: 'sign', label: 'Fill & Sign', icon: 'local:signature' },
  { id: 'edit', label: 'Edit PDF', icon: 'local:edit' },
  { id: 'download', label: 'Download PDF', icon: 'local:download' },
  { id: 'print', label: 'Print PDF', icon: 'local:print' },
] as const
</script>

<template>
  <aside class="flex size-full flex-col overflow-y-auto border-l border-dark-500 bg-dark-400 p-6 md:w-[360px]">
    <div v-if="!document" class="flex h-full flex-col items-center justify-center text-white/40">
      <NuxtIcon name="local:document" class="mb-4 text-4xl opacity-50" />
      <p class="font-semibold text-sm">Select a document to preview</p>
    </div>

    <div v-else class="flex flex-col gap-6">
      <!-- Top: Large Document Preview Canvas -->
      <div class="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-dark-500 p-4 shadow-inner">
        <img v-if="document.previewUrl" :src="document.previewUrl" :alt="document.name" class="size-full object-contain shadow-md" />
        <NuxtIcon v-else name="local:file-pdf" class="text-7xl text-light-500/40" />
      </div>

      <!-- Middle: Metadata Block -->
      <div class="flex flex-col gap-1 border-b border-white/5 pb-5">
        <h2 class="font-semibold truncate text-base text-white" :title="document.name">{{ document.name }}</h2>
        <p class="text-xs text-light-500">
          <span class="uppercase">{{ document.extension }}</span> • Opened {{ document.openedAt || document.uploadedAt }}
        </p>
        <p class="font-mono truncate text-[11px] text-light-500/70" :title="document.filePath || document.source">
          {{ document.filePath || document.source || 'Cloud Workspace' }}
        </p>
      </div>

      <!-- Bottom: Action Menu List -->
      <nav class="flex flex-col gap-1">
        <button
          v-for="action in sidebarActions"
          :key="action.id"
          type="button"
          class="font-medium group flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left text-sm text-light-400 transition-colors hover:bg-white/5 hover:text-white">
          <NuxtIcon :name="action.icon" class="text-lg text-light-500 transition-colors group-hover:text-primary-400" />
          <span class="truncate">{{ action.label }}</span>
        </button>
      </nav>
    </div>
  </aside>
</template>
