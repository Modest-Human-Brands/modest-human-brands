<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string
const selectedDocId = ref<string | null>(null)

const { data: documents, pending } = await useFetch<
  {
    id: string
    name: string
    sizeBytes: number
    extension: string
    uploadedBy: {
      name: string | undefined
      avatar: string | undefined
    }
    uploadedAt: string
    project: string | undefined
    source: string
    previewUrl: string
  }[]
>(`/api/doc/${projectId}`)

const activeDocument = computed(() => documents.value?.find((d) => d.id === selectedDocId.value) || null)

watch(
  documents,
  (newDocs) => {
    if (newDocs && newDocs.length > 0 && !selectedDocId.value) {
      selectedDocId.value = newDocs[0].id
    }
  },
  { immediate: true }
)

const getFileIcon = (ext: string) => {
  const map: Record<string, string> = {
    PDF: 'local:file-pdf',
    'Excel Sheet': 'local:file-excel',
    PowerPoint: 'local:file-powerpoint',
    'Word Document': 'local:file-document',
    PNG: 'local:file-image',
  }
  return map[ext] || 'local:file-document'
}
</script>

<template>
  <main class="flex size-full overflow-hidden bg-dark-400">
    <div class="flex min-w-0 flex-1 flex-col border-r border-dark-500 bg-dark-400 transition-all duration-300">
      <div class="font-semibold grid grid-cols-[auto_2fr_1fr_1.5fr] items-center gap-4 border-y border-white/5 px-6 py-3 text-xs uppercase tracking-wider text-light-500">
        <div class="w-5" />
        <span>Name</span>
        <div class="flex cursor-pointer items-center gap-1 transition-colors hover:text-white">
          Date
          <NuxtIcon name="local:chevron-bold" class="-rotate-90 text-[10px]" />
        </div>
        <span>Uploaded By</span>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="pending" class="flex flex-col gap-4 p-6">
          <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-lg bg-white/5" />
        </div>

        <div v-else-if="!documents?.length" class="p-6 text-center text-sm text-light-500">No documents found for this project.</div>
        <template v-else>
          <NuxtLink
            v-for="doc in documents"
            :key="doc.id"
            :to="`/doc/${projectId}/${doc.id}`"
            :class="[
              'grid cursor-pointer grid-cols-[auto_2fr_1fr_1.5fr] items-center gap-4 border-b border-white/5 px-6 py-4 transition-colors',
              selectedDocId === doc.id ? 'bg-white/5' : 'hover:bg-white/[0.02]',
            ]"
            @click="selectedDocId = doc.id">
            <div class="flex w-5 items-center justify-center">
              <div class="size-4 rounded border border-light-500/50 transition-colors hover:border-white" />
            </div>

            <div class="flex min-w-0 items-center gap-4">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dark-500 text-white">
                <NuxtIcon :name="getFileIcon(doc.extension)" class="text-xl" />
              </div>
              <div class="flex min-w-0 flex-col gap-0.5">
                <span class="font-semibold truncate text-sm text-white">{{ doc.name }}</span>
                <span class="font-semibold truncate text-xs text-light-500">{{ formatBytes(doc.sizeBytes) }} • {{ doc.extension }}</span>
              </div>
            </div>

            <span class="font-semibold text-sm text-white/80">{{ doc.uploadedAt }}</span>

            <div class="flex items-center gap-3">
              <div class="font-semibold flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs text-black">
                <img v-if="doc.uploadedBy?.avatar" :src="doc.uploadedBy?.avatar" class="size-full object-cover" />
                <span v-else>{{ doc.uploadedBy?.name?.charAt(0) }}</span>
              </div>
              <span class="font-semibold truncate text-sm text-white">{{ doc.uploadedBy?.name }}</span>
            </div>
          </NuxtLink>
        </template>
      </div>

      <div class="font-semibold flex items-center justify-between border-t border-white/5 px-6 py-4 text-sm text-light-500">
        <div class="flex items-center gap-2">
          <button class="flex size-8 items-center justify-center rounded bg-dark-500/50 transition-colors hover:bg-dark-500 hover:text-white">
            <NuxtIcon name="local:chevron-bold" />
          </button>
          <span class="flex size-8 items-center justify-center rounded border border-primary-500 bg-dark-500 text-white">1</span>
          <button class="flex size-8 items-center justify-center rounded bg-dark-500/50 transition-colors hover:bg-dark-500 hover:text-white">
            <NuxtIcon name="local:chevron-bold" class="scale-x-[-1]" />
          </button>
        </div>
        <span>Page 1 of 1</span>
      </div>
    </div>

    <div class="hidden shrink-0 transition-all duration-300 md:block">
      <DocPreviewSidebar :document="activeDocument" />
    </div>
  </main>
</template>
