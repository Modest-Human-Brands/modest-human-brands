<script setup lang="ts">
definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string

const columns: { id: ProjectDocumentStatus; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'ready', label: 'Ready' },
  { id: 'sent', label: 'Sent' },
  { id: 'partially-signed', label: 'Partially Signed' },
  { id: 'completed', label: 'Completed' },
  { id: 'void', label: 'Void' },
]

const { data: documents, pending, error } = await useFetch<ProjectDocument[]>(`/api/project/${projectId}/document`, { default: () => [] })

function documentsFor(status: ProjectDocumentStatus): ProjectDocument[] {
  return documents.value.filter((doc) => doc.status === status)
}
</script>

<template>
  <div class="flex min-h-0 grow flex-col overflow-hidden">
    <p v-if="error" class="text-error-500 px-4 pt-4 text-sm md:px-8">Documents are unavailable right now. Try again in a moment.</p>
    <section class="scrollbar-hidden flex min-h-0 grow gap-4 overflow-x-auto p-4 md:gap-6 md:p-8">
      <div v-if="pending" class="flex gap-4 md:gap-6">
        <div v-for="i in 3" :key="i" class="h-80 w-72 shrink-0 animate-pulse rounded-xl bg-dark-500 md:w-80" />
      </div>

      <template v-else>
        <div v-for="column in columns" :key="column.id" class="flex w-72 shrink-0 flex-col gap-4 md:w-[265px] md:gap-6">
          <KanbanHeader :title="column.label" />

          <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-4 overflow-y-auto pb-4">
            <p v-if="!documentsFor(column.id).length" class="py-4 text-center text-xs text-light-500">No documents</p>
            <CardDocument v-for="doc in documentsFor(column.id)" :key="doc.id" :document="doc" :project-id="projectId" />
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
