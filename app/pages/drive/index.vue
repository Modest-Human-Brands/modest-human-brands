<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: projects } = await useFetch(`/api/project`)
</script>

<template>
  <section class="relative flex h-full overflow-hidden">
    <template v-if="!projects?.length"> No Project Details Found </template>
    <template v-else>
      <div class="flex flex-1 flex-col items-stretch gap-4 overflow-y-auto">
        <CardProject v-for="project in projects" :key="project.slug" v-bind="project" />
      </div>
    </template>
  </section>
</template>
