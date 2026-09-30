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
      selectedDocId.value = newDocs.at(-1)!.id
    }
  },
  { immediate: true }
)

function toggleSelectAll(event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked
  if (isChecked && documents.value) {
    selectedDocIds.value = new Set(documents.value.map((d) => d.id))
  } else {
    selectedDocIds.value.clear()
  }
}

function toggleRowSelection(id: string) {
  if (selectedDocIds.value.has(id)) {
    selectedDocIds.value.delete(id)
  } else {
    selectedDocIds.value.add(id)
  }
}

function handleRowClick(docId: string) {
  selectedDocId.value = docId
  showMobileDrawer.value = true
}
</script>

<template>
  <main class="relative flex size-full overflow-hidden bg-dark-400 pt-2 md:pt-4">
    <div class="flex min-w-0 flex-1 flex-col border-r border-dark-500 bg-dark-400 transition-all duration-300">
      <!-- Header Row -->
      <div
        class="grid select-none grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-2.5 border-y border-white/5 px-4 py-3 text-[11px] font-semi-bold uppercase tracking-wider text-light-500 md:grid-cols-[2.5rem_minmax(0,1fr)_9rem_6rem] md:gap-4 md:px-6">
        <input
          type="checkbox"
          :checked="Boolean(documents?.length && selectedDocIds.size === documents.length)"
          class="size-4 cursor-pointer rounded border-white/10 bg-dark-500 accent-accent-500"
          @change="toggleSelectAll" />
        <span>Name</span>
        <span class="hidden md:block">Opened</span>
        <span class="text-right">Size</span>
      </div>

      <!-- Table Body -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="pending" class="flex flex-col gap-4 p-6">
          <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-lg bg-white/5" />
        </div>

        <div v-else-if="!documents?.length" class="p-6 text-center text-sm text-light-500">No documents found in this workspace.</div>

        <template v-else>
          <DocTableRow
            v-for="document in documents"
            :key="document.id"
            :document="document"
            :project-id="projectId"
            :is-selected="selectedDocId === document.id"
            :is-checked="selectedDocIds.has(document.id)"
            @select="handleRowClick(document.id)"
            @toggle-check="toggleRowSelection(document.id)" />
        </template>
      </div>
    </div>

    <!-- Document Preview Sidebar -->
    <DocPreviewSidebar :document="activeDocument" />
  </main>
</template>
