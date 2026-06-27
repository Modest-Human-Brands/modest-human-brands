<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string
const selectedDocId = ref<string | null>(null)
const selectedDocIds = ref<Set<string>>(new Set())
const showMobileDrawer = ref(false)

const { data: documents, pending } = await useFetch(`/api/doc/${projectId}`)

const activeDocument = computed(() => documents.value?.find((d) => d.id === selectedDocId.value) ?? null)

watch(
  documents,
  (newDocs) => {
    if (newDocs && newDocs.length > 0 && !selectedDocId.value) {
      selectedDocId.value = newDocs[0]!.id
    }
  },
  { immediate: true }
)

function getFileIcon(ext?: string): string {
  const map: Record<string, string> = {
    PDF: 'local:file-pdf',
    'Excel Sheet': 'local:file-excel',
    PowerPoint: 'local:file-powerpoint',
    'Word Document': 'local:file-document',
    PNG: 'local:file-image',
  }
  return map[ext?.toUpperCase() ?? ''] ?? 'local:file-document'
}

function toggleSelectAll(event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked
  if (isChecked && documents.value) {
    selectedDocIds.value = new Set(documents.value.map((d) => d.id))
  } else {
    selectedDocIds.value.clear()
  }
}

function toggleRowSelection(id: string) {
  if (selectedDocIds.value.has(id)) selectedDocIds.value.delete(id)
  else selectedDocIds.value.add(id)
}

function handleRowClick(docId: string) {
  selectedDocId.value = docId
  showMobileDrawer.value = true
}
</script>

<template>
  <main class="relative flex size-full overflow-hidden bg-dark-400 pt-2 md:pt-4">
    <div class="flex min-w-0 flex-1 flex-col border-r border-dark-500 bg-dark-400 transition-all duration-300">
      <!-- Table Header -->
      <div
        class="grid select-none grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-2.5 border-y border-white/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-light-500 md:grid-cols-[2.5rem_minmax(0,1fr)_9rem_6rem] md:gap-4 md:px-6">
        <input type="checkbox" class="size-4 cursor-pointer rounded border-white/10 bg-dark-500 accent-primary-500" @change="toggleSelectAll" />
        <span>Name</span>
        <span class="hidden md:block">Opened</span>
        <span class="text-right">Size</span>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="pending" class="flex flex-col gap-4 p-6">
          <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-lg bg-white/5" />
        </div>

        <div v-else-if="!documents?.length" class="p-6 text-center text-sm text-light-500">No documents found in this workspace.</div>

        <template v-else>
          <NuxtLink
            v-for="doc in documents"
            :key="doc.id"
            :to="`/doc/${projectId}/${doc.id}`"
            :class="[
              'group grid cursor-pointer select-none grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-2.5 border-b border-white/5 px-4 py-3.5 text-sm transition-colors active:bg-white/5 md:grid-cols-[2.5rem_minmax(0,1fr)_9rem_6rem] md:gap-4 md:px-6',
              selectedDocId === doc.id ? 'bg-primary-500/10 text-white' : 'text-light-400 hover:bg-white/[0.03]',
            ]"
            @click="handleRowClick(doc.id)">
            <!-- Col 1: Checkbox -->
            <div class="flex size-7 items-center justify-start" @click.stop>
              <input type="checkbox" :checked="selectedDocIds.has(doc.id)" class="size-4 cursor-pointer rounded border-white/10 bg-dark-500 accent-primary-500" @change="toggleRowSelection(doc.id)" />
            </div>

            <!-- Col 2: Thumbnail & Name -->
            <div class="flex min-w-0 items-center gap-3.5">
              <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded bg-white shadow-sm">
                <img v-if="doc.previewUrl" :src="doc.previewUrl" class="size-full object-cover" />
                <NuxtIcon v-else :name="getFileIcon(doc.extension)" class="text-2xl text-dark-500" />
              </div>

              <div class="flex min-w-0 flex-col">
                <div class="flex items-center gap-1.5">
                  <span class="font-medium truncate text-white" :title="doc.name">{{ doc.name }}</span>
                  <NuxtIcon name="local:star" class="shrink-0 text-base text-light-600 opacity-100 transition-opacity hover:text-warning-400 md:text-[20px] md:opacity-0 md:group-hover:opacity-100" />
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-light-500">{{ doc.extension }}</span>
              </div>
            </div>

            <!-- Col 3: Opened Timestamp -->
            <span class="hidden truncate text-xs text-light-500 md:block">{{ doc.openedAt || doc.uploadedAt }}</span>

            <!-- Col 4: Formatted Size -->
            <span class="font-mono text-right text-xs text-light-500">{{ formatBytes(doc.sizeBytes) }}</span>
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <div class="hidden shrink-0 transition-all duration-300 md:block">
      <DocPreviewSidebar :document="activeDocument" />
    </div>

    <!-- Mobile Bottom Sheet Drawer -->
    <Teleport to="body">
      <div v-if="showMobileDrawer && activeDocument" class="backdrop-blur-xs fixed inset-0 z-50 flex flex-col justify-end bg-black/60 md:hidden" @click="showMobileDrawer = false">
        <div class="max-h-[85vh] w-full overflow-hidden rounded-t-2xl border-t border-white/10 bg-dark-400 shadow-2xl transition-transform duration-300" @click.stop>
          <div class="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <span class="text-xs font-bold uppercase tracking-wider text-light-500">Document Actions</span>
            <button type="button" class="rounded-lg p-1 text-light-500 hover:bg-white/5 hover:text-white" @click="showMobileDrawer = false">
              <NuxtIcon name="local:cross" class="text-lg" />
            </button>
          </div>
          <div class="max-h-[calc(85vh-3.5rem)] overflow-y-auto">
            <DocPreviewSidebar :document="activeDocument" />
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>
