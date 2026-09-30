<script setup lang="ts">
export type DocumentStatus = 'draft' | 'ready' | 'sent' | 'partially-signed' | 'completed' | 'void'

export interface DocumentCollaborator {
  id: string
  name: string
  avatar?: string
}

export interface DocumentItem {
  id: string
  docNumber: string
  fileType: string
  title: string
  description: string
  status: DocumentStatus
  updatedAgo: string
  pages: number
  sizeMb: number
  contractTitle: string
  contractSubtitle: string
  orgName: string
  orgSubtitle: string
  address: string
  issuedDate: string
  expiryDate: string
  collaborators: DocumentCollaborator[]
  previewUrl?: string
  shareUrl?: string
}

interface Props {
  document: DocumentItem
  projectId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'share' | 'menu', document: DocumentItem): void
}>()

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatSize(sizeMb: number): string {
  return `${sizeMb.toFixed(1)} MB`
}

async function handleShare(): Promise<void> {
  const { copy } = useClipboard()
  const fallbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/${props.projectId ?? ''}/document/${props.document.id}` : ''

  await copy(props.document.shareUrl || fallbackUrl)
  emit('share', props.document)
}
</script>

<template>
  <article class="overflow-hidden rounded-xl bg-dark-500">
    <!-- Preview -->
    <img v-if="document.previewUrl" :src="document.previewUrl" :alt="document.title" class="aspect-[2/1] w-full object-cover object-top" />

    <!-- Body -->
    <div class="space-y-4 p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-base font-semi-bold text-white">{{ document.title }}</h3>
        <span class="inline-flex shrink-0 items-center gap-2 rounded-full bg-info-500/20 px-3 py-1 text-xs font-semi-bold text-info-400">
          {{ document.status }}
        </span>
      </div>

      <p class="text-sm text-light-500">{{ document.description }}</p>

      <div class="flex items-center gap-4 border-t border-dark-600 pt-3 text-xs text-light-500">
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="ph:clock" class="shrink-0 text-base" />
          {{ document.updatedAgo }}
        </span>
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="ph:file-text" class="shrink-0 text-base" />
          {{ document.pages }} Pages
        </span>
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="ph:download-simple" class="shrink-0 text-base" />
          {{ formatSize(document.sizeMb) }}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex -space-x-2">
          <span
            v-for="collaborator in document.collaborators"
            :key="collaborator.id"
            class="flex size-7 items-center justify-center rounded-full border-2 border-dark-500 bg-dark-600 text-[10px] font-semi-bold text-white">
            {{ initials(collaborator.name) }}
          </span>
        </div>

        <button type="button" class="flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-semi-bold text-white hover:bg-accent-600" @click="handleShare">
          <NuxtIcon name="ph:link" class="shrink-0 text-sm" />
          Share
        </button>
      </div>
    </div>
  </article>
</template>
