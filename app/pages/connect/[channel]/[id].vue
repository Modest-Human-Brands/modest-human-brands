<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['auth'],
})

const route = useRoute()
const contentId = String(route.params.id)
</script>

<template>
  <main class="relative flex size-full overflow-hidden">contentId {{ contentId }}</main>
</template>
