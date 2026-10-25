<script setup lang="ts">
definePageMeta({
  layout: 'project-detail',
  middleware: ['auth'],
})
</script>

<template>
  <ProjectItemDetail kind="setup" />
</template>
