<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: mediaCollections, pending } = await useFetch('/api/drive')
const orgSlug = 'red-cat-pictures'
</script>

<template>
  <main class="flex size-full select-none overflow-hidden bg-dark-400">
    <div class="flex size-full flex-1 flex-col overflow-y-auto p-2 md:p-4">
      <div v-if="pending" class="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-3 2xl:grid-cols-4">
        <div v-for="i in 8" :key="i" class="aspect-square w-full animate-pulse rounded-2xl bg-white/5" />
      </div>

      <div v-else-if="mediaCollections.data?.length" class="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-3 2xl:grid-cols-4">
        <CardMediaCollection v-for="(mediaCollection, i) in mediaCollections.data" :key="mediaCollection.slug" :org-slug="orgSlug" :media-collection="mediaCollection" :index="i" />
      </div>

      <div v-else class="my-auto flex h-full flex-col items-center justify-center text-light-500/40">
        <NuxtIcon name="local:folder" class="mb-3 text-4xl" />
        <p class="text-xs font-semi-bold">No media collections found.</p>
      </div>
    </div>
  </main>
</template>
