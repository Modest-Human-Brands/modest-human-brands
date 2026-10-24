<script setup lang="ts">
definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})
</script>

<template>
  <ProjectItemDetail kind="look" />
</template>
