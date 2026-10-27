<script setup lang="ts">
const props = defineProps<{
  document: ProjectDocument
  projectId?: string
}>()

const emit = defineEmits<{
  share: [document: ProjectDocument]
}>()

const updatedAgo = useTimeAgo(() => new Date(props.document.updatedAt))

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatSize(sizeBytes: number): string {
  return sizeBytes >= 1024 * 1024 ? `${(sizeBytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
}

async function handleShare(): Promise<void> {
  const { copy } = useClipboard()

  await copy(`${window.location.origin}/doc/${props.projectId ?? ''}/${props.document.id}`)
  emit('share', props.document)
}
</script>

<template>
  <article class="overflow-hidden rounded-xl bg-dark-500">
    <img v-if="document.previewUrl" :src="document.previewUrl" :alt="document.title" class="aspect-[2/1] w-full object-cover object-top" loading="lazy" />

    <div class="space-y-4 p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="min-w-0 truncate text-base font-semi-bold capitalize text-white">{{ document.title }}</h3>
        <span class="inline-flex shrink-0 items-center rounded-full bg-info-500/20 px-3 py-1 text-xs font-semi-bold capitalize text-info-400">
          {{ document.status.replace('-', ' ') }}
        </span>
      </div>

      <div class="flex items-center gap-4 border-t border-dark-600 pt-3 text-xs text-light-500">
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="ph:clock" class="shrink-0 text-base" />
          {{ updatedAgo }}
        </span>
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="ph:file-text" class="shrink-0 text-base" />
          {{ document.fileType }}
        </span>
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="ph:download-simple" class="shrink-0 text-base" />
          {{ formatSize(document.sizeBytes) }}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex -space-x-2">
          <span
            v-if="document.contact"
            class="flex size-7 items-center justify-center rounded-full border-2 border-dark-500 bg-dark-600 text-[10px] font-semi-bold text-white"
            :title="document.contact.name">
            {{ initials(document.contact.name) }}
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
