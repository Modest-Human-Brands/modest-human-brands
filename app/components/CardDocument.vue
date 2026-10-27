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
  <!-- Figma: Card/Document (256 wide, radius 4) -->
  <article class="relative overflow-hidden rounded bg-dark-500">
    <div class="relative aspect-[2/1] w-full bg-dark-600">
      <img v-if="document.previewUrl" :src="document.previewUrl" :alt="document.title" class="size-full object-cover object-top" loading="lazy" />
      <span class="absolute bottom-1 left-1 rounded bg-dark-500 px-2 pb-[3px] pt-0.5 text-2xs font-semi-bold uppercase">{{ document.fileType }}</span>
    </div>

    <div class="flex flex-col gap-2 pt-[10px]">
      <div class="flex items-start justify-between gap-2 px-2">
        <h3 class="min-w-0 truncate text-sm">{{ document.title }}</h3>
        <span class="shrink-0 rounded bg-info-600 px-2 pb-[3px] pt-0.5 text-2xs font-semi-bold capitalize">
          {{ document.status.replace('-', ' ') }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-[35px] border-y border-dark-600 px-3 py-2 text-2xs font-semi-bold">
        <span class="flex items-center gap-1">
          <NuxtIcon name="local:clock" class="shrink-0 text-base" />
          {{ updatedAgo }}
        </span>
        <span class="flex items-center gap-1">
          <NuxtIcon name="local:download" class="shrink-0 text-base" />
          {{ formatSize(document.sizeBytes) }}
        </span>
      </div>

      <div class="flex h-12 items-end px-2 pb-2">
        <span v-if="document.contact" class="flex size-6 items-center justify-center rounded-full bg-dark-600 text-2xs font-semi-bold text-white" :title="document.contact.name">
          {{ initials(document.contact.name) }}
        </span>
      </div>
    </div>

    <button type="button" class="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-md bg-accent-500 px-2 py-1 text-2xs font-semi-bold text-white hover:bg-accent-600" @click="handleShare">
      <NuxtIcon name="local:link" class="shrink-0 text-base" />
      Share
    </button>
  </article>
</template>
