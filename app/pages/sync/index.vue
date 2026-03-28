<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: streams, pending } = await useFetch('/api/stream')
const orgSlug = 'red-cat-pictures'
</script>

<template>
  <section class="h-full w-[calc(100%+0.5rem)] overflow-y-auto pr-1 md:w-[calc(100%+1rem)] md:pr-2">
    <!-- Loading skeleton -->
    <div v-if="pending" class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 4" :key="i" class="aspect-[4/5] animate-pulse rounded-sm bg-dark-500" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!streams?.length" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p class="text-2xl font-light text-white">No Projects Found</p>
      <p class="mt-3 text-sm uppercase tracking-widest text-light-500">Start Stream to get started</p>
    </div>

    <template v-else>
      <div class="flex flex-1 flex-col items-center">
        <CardStreamCollection v-for="stream in streams" :key="stream.slug" :org-slug="orgSlug" :stream-collection="stream" />
      </div>
    </template>
  </section>
</template>
