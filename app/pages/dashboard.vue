<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const columns = [
  { id: 'Plan', title: 'Plan' },
  { id: 'Crew', title: 'Crew' },
  { id: 'Document', title: 'Document' },
  { id: 'Pre-Prod', title: 'Pre-Production' },
  { id: 'Production', title: 'Production' },
  { id: 'Post-Production', title: 'Post-Production' },
]

const { data: projects } = await useFetch('/api/project', { default: () => [] })
</script>

<template>
  <div class="flex size-full flex-col gap-5 overflow-y-auto bg-dark-400 p-3 md:p-6">
    <ProjectTimeline :projects="projects" class="shrink-0" />

    <section class="scrollbar-hidden flex shrink-0 snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto pb-4 md:pb-0">
      <div v-for="column in columns" :key="column.id" class="flex w-full max-w-[200px] shrink-0 snap-center flex-col gap-6 md:max-w-[265px]">
        <KanbanHeader :title="column.title" />
        <div class="flex flex-col gap-3">
          <CardProject v-for="project in projects.filter((p) => p.status === column.id)" :key="project.id" v-bind="project" />
        </div>
      </div>
    </section>
  </div>
</template>
