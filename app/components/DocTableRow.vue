<script setup lang="ts">
export interface DocumentItem {
  id: string
  name: string
  extension?: string
  sizeBytes?: number
  previewUrl?: string
  openedAt?: string
  uploadedAt?: string
}

interface Props {
  document: DocumentItem
  projectId: string
  isSelected?: boolean
  isChecked?: boolean
}

withDefaults(defineProps<Props>(), {
  isSelected: false,
  isChecked: false,
})

defineEmits<{
  (e: 'select' | 'toggleCheck'): void
}>()

function getFileIcon(ext?: string): string {
  const map: Record<string, string> = {
    PDF: 'local:file-pdf',
    'EXCEL SHEET': 'local:file-excel',
    POWERPOINT: 'local:file-powerpoint',
    'WORD DOCUMENT': 'local:photo',
    PNG: 'local:file-image',
  }
  return map[ext?.toUpperCase() ?? ''] ?? 'local:photo'
}

function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    :class="[
      'group grid cursor-pointer select-none grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-2.5 border-b border-white/5 px-4 py-3.5 text-sm transition-colors active:bg-white/5 md:grid-cols-[2.5rem_minmax(0,1fr)_9rem_6rem] md:gap-4 md:px-6',
      isSelected ? 'bg-accent-500/10 text-white' : 'text-light-400 hover:bg-white/[0.03]',
    ]"
    @click="$emit('select')"
    @keydown.enter.self="$emit('select')"
    @keydown.space.prevent.self="$emit('select')">
    <!-- Checkbox selection -->
    <div class="flex size-7 items-center justify-start" @click.stop>
      <input type="checkbox" :checked="isChecked" class="size-4 cursor-pointer rounded border-white/10 bg-dark-500 accent-accent-500" @change="$emit('toggleCheck')" />
    </div>

    <!-- Document Info & Actions -->
    <div class="flex min-w-0 items-center justify-between gap-3.5">
      <div class="flex min-w-0 items-center gap-3.5">
        <div class="flex aspect-[3/4] w-9 shrink-0 items-center justify-center overflow-hidden rounded-sm shadow-sm">
          <NuxtImg v-if="document.previewUrl" :src="`${document.previewUrl}?type=image`" class="size-full object-cover" />
          <NuxtIcon v-else :name="getFileIcon(document.extension)" class="text-2xl text-dark-500" />
        </div>

        <div class="flex min-w-0 flex-col">
          <div class="flex items-center gap-1.5">
            <span class="font-medium truncate text-white" :title="document.name">{{ document.name }}</span>
            <NuxtIcon name="local:star" class="shrink-0 text-base text-light-600 opacity-100 transition-opacity hover:text-warning-400 md:text-[20px] md:opacity-0 md:group-hover:opacity-100" />
          </div>
          <span class="text-[10px] font-semi-bold uppercase tracking-wider text-light-500">
            {{ document.extension }}
          </span>
        </div>
      </div>

      <!-- Open Link Button (Navigates to document page) -->
      <NuxtLink
        :to="`/doc/${projectId}/${document.id}`"
        class="font-medium text-light-300 ml-2 hidden shrink-0 items-center gap-1 rounded bg-white/5 px-2.5 py-1 text-xs transition-all hover:bg-accent-500 hover:text-white md:inline-flex md:opacity-0 md:group-hover:opacity-100"
        @click.stop>
        <span>Open</span>
      </NuxtLink>
    </div>

    <!-- Date (Opened / Uploaded) -->
    <span class="hidden truncate text-xs text-light-500 md:block">
      {{ document.openedAt || document.uploadedAt }}
    </span>

    <!-- Size & Mobile Open Button -->
    <div class="flex items-center justify-end gap-2 text-right">
      <span class="font-mono text-xs text-light-500">{{ formatBytes(document.sizeBytes) }}</span>

      <!-- Mobile Open button icon -->
      <NuxtLink
        :to="`/doc/${projectId}/${document.id}`"
        class="text-light-300 inline-flex size-6 items-center justify-center rounded bg-white/5 text-xs hover:bg-accent-500 hover:text-white md:hidden"
        title="Open Document"
        @click.stop>
        ↗
      </NuxtLink>
    </div>
  </div>
</template>
