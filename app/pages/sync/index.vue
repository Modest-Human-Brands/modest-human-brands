<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: streamCollections, pending } = await useFetch('/api/stream')
const orgSlug = 'red-cat-pictures'
</script>

<template>
  <section class="my-1 h-full overflow-y-auto px-2 py-1 md:my-2 md:px-4 md:py-2">
    <!-- Loading skeleton -->
    <div v-if="pending" class="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 4" :key="i" class="aspect-[4/5] animate-pulse rounded-sm bg-dark-500" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!streamCollections?.length" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p class="text-2xl font-light text-white">No Projects Found</p>
      <p class="mt-3 text-sm uppercase tracking-widest text-white">Start Stream to get started</p>
    </div>

    <template v-else>
      <div class="flex grow flex-col items-center">
        <CardStreamCollection v-for="stream in streamCollections" :key="stream.slug" :org-slug="orgSlug" :stream-collection="stream" />
      </div>
    </template>
  </section>
</template>
