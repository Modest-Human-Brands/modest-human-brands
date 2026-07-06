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

const isOpen = ref(false)

interface SidebarAction {
  id: string
  label: string
  icon: string
}

const sidebarActions: readonly SidebarAction[] = [
  { id: 'comment', label: 'Add comments', icon: 'local:chat' },
  { id: 'sign', label: 'Fill & Sign', icon: 'local:signature' },
  { id: 'edit', label: 'Edit PDF', icon: 'local:pen' },
  { id: 'download', label: 'Download PDF', icon: 'local:download' },
  { id: 'print', label: 'Print PDF', icon: 'local:print' },
  { id: 'summary', label: 'Show Summary', icon: 'local:notepad-sparkle' },
] as const
</script>

<template>
  <AppSidebar v-model:open="isOpen" as-drawer-on-mobile>
    <div class="flex h-full flex-col p-4 md:p-2">
      <div v-if="!document" class="flex h-full flex-col items-center justify-center pb-10 text-white/40 md:pb-0">
        <NuxtIcon name="local:document" class="mb-4 text-4xl opacity-50" />
        <p class="text-sm font-semi-bold">Select a document to preview</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div class="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-md border border-white/10 bg-dark-500">
          <NuxtImg v-if="document.previewUrl" :src="document.previewUrl" :alt="document.name" class="size-full object-contain" />
          <NuxtIcon v-else name="local:file-pdf" class="text-7xl text-light-500/40" />
        </div>

        <div class="flex flex-col gap-1">
          <h2 class="truncate text-base font-semi-bold text-white" :title="document.name">{{ document.name }}</h2>
          <p class="text-xs text-light-500">
            <span class="uppercase">{{ document.extension }}</span> • Opened {{ document.openedAt || document.uploadedAt }}
          </p>
          <p class="truncate text-sm text-light-500/70" :title="document.filePath || document.source">
            {{ document.filePath || document.source || 'Cloud Workspace' }}
          </p>
        </div>

        <nav class="mt-2 flex flex-col gap-1 border-t border-white/5 py-4">
          <button
            v-for="action in sidebarActions"
            :key="action.id"
            type="button"
            class="font-medium group flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left text-sm text-light-400 transition-colors hover:bg-white/5 hover:text-white"
            @click="isOpen = false">
            <NuxtIcon :name="action.icon" class="text-lg text-light-500 transition-colors group-hover:text-primary-400" />
            <span class="truncate">{{ action.label }}</span>
          </button>
        </nav>
      </div>
    </div>
  </AppSidebar>
</template>
