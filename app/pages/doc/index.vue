<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: documentCollections, pending } = await useFetch('/api/document')
const orgSlug = 'red-cat-pictures'
</script>

<template>
  <section class="my-1 h-full overflow-y-auto px-2 py-1 md:my-2 md:px-4 md:py-2">
    <div v-if="pending" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 8" :key="i" class="h-40 animate-pulse rounded-md bg-dark-500" />
    </div>
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <CardDocCollection v-for="(document, i) in documentCollections" :key="document.slug" :org-slug="orgSlug" :document-collection="document" :index="i" />
    </div>
  </section>
</template>
