<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})
const { data: projects, pending } = await useFetch('/api/project', { default: () => [] })
</script>

<template>
  <main class="flex size-full overflow-hidden bg-dark-400">
    <div class="flex flex-1 flex-col overflow-y-auto p-2 md:p-4">
      <div v-if="pending" class="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="i in 10" :key="i" class="w-full animate-pulse rounded-2xl bg-white/5 pt-[75%]"></div>
      </div>
      <div v-else-if="projects && projects.length > 0" class="grid grid-cols-2 justify-between gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
      </div>
      <div v-else class="flex h-full flex-col items-center justify-center text-white/40">
        <NuxtIcon name="local:target" class="mb-4 text-4xl opacity-50" />
        <p class="text-sm font-semi-bold">No projects found.</p>
      </div>
    </div>
  </main>
</template>
