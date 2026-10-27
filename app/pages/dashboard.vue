<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const columns = [
  { id: 'Plan', title: 'Plan' },
  { id: 'Crew', title: 'Crew' },
  { id: 'Document', title: 'Document' },
  { id: 'Pre-Production', title: 'Pre-Production' },
  { id: 'Production', title: 'Production' },
  { id: 'Post-Production', title: 'Post-Production' },
]
const stages = columns.map(({ id }) => id)

const { data: projects } = await useFetch('/api/project', { default: () => [] })

const draggedId = ref('')
const overStage = ref('')
const moveError = ref('')

// useFetch data is a shallow ref, so a project is replaced rather than mutated for the board to re-render
function patchProject(id: string, fields: { status: ProjectStatus; progress: number }) {
  projects.value = projects.value.map((p) => (p.id === id ? { ...p, ...fields } : p))
}

// Moves a project on screen first, and puts it back if the server refuses
async function moveProject(id: string, stage: string) {
  const project = projects.value.find((p) => p.id === id)
  if (!project || project.status === stage) return

  const previous = { status: project.status, progress: project.progress }
  patchProject(id, { status: stage as ProjectStatus, progress: Math.round(((stages.indexOf(stage) + 1) / (stages.length + 1)) * 100) })
  moveError.value = ''

  try {
    patchProject(id, await $fetch<{ status: ProjectStatus; progress: number }>(`/api/project/${id}/stage`, { method: 'PUT', body: { stage } }))
  } catch {
    patchProject(id, previous)
    moveError.value = `Could not move "${project.title}" to ${stage}`
  }
}

function onDrop(stage: string) {
  if (draggedId.value) moveProject(draggedId.value, stage)
  draggedId.value = ''
  overStage.value = ''
}
</script>

<template>
  <div class="flex size-full flex-col gap-5 overflow-y-auto bg-dark-400 p-3 md:p-6">
    <ProjectTimeline :projects="projects" class="shrink-0" />

    <p v-if="moveError" class="text-error-500 text-sm">{{ moveError }}</p>

    <section class="scrollbar-hidden flex shrink-0 snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto pb-4 md:pb-0">
      <div
        v-for="column in columns"
        :key="column.id"
        class="flex w-full max-w-[200px] shrink-0 snap-center flex-col gap-6 rounded-xl transition-colors md:max-w-[265px]"
        :class="{ 'bg-white/5': overStage === column.id && draggedId }"
        @dragover.prevent="overStage = column.id"
        @dragleave.self="overStage = ''"
        @drop.prevent="onDrop(column.id)">
        <KanbanHeader :title="column.title" />
        <div class="flex min-h-24 flex-col gap-3">
          <CardProject
            v-for="project in projects.filter((p) => p.status === column.id)"
            :key="project.id"
            v-bind="project"
            :stages="stages"
            @dragstart="draggedId = project.id"
            @dragend="draggedId = ''"
            @move="moveProject(project.id, $event)" />
        </div>
      </div>
    </section>
  </div>
</template>
