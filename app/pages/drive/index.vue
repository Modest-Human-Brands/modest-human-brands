<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
})

const { data: projects } = await useFetch(`/api/project`)
</script>

<template>
  <section class="mt-8 flex flex-col items-stretch justify-start gap-4">
    <ProjectFolder v-for="project in projects" :key="project.slug" v-bind="project" />
  </section>
</template>
