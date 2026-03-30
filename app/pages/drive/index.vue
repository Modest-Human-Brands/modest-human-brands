<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: medias, pending } = await useFetch(`/api/media`)

const orgSlug = 'red-cat-pictures'
</script>

<template>
  <div class="h-full overflow-y-auto p-2 md:p-2.5">
    <!-- Loading skeleton -->
    <div v-if="pending" class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 4" :key="i" class="aspect-[4/5] animate-pulse rounded-sm bg-dark-500" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!medias?.length" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p class="text-2xl font-light text-white">No Projects Found</p>
      <p class="mt-3 text-sm uppercase tracking-widest text-light-500">Upload media to get started</p>
    </div>

    <!-- Collections grid -->
    <template v-else>
      <div class="grid grid-cols-2 gap-1.5 md:gap-2 lg:grid-cols-3 2xl:grid-cols-4">
        <CardMediaCollection v-for="(media, i) in medias" :key="media.slug" :org-slug="orgSlug" :media-collection="media" :index="i" />
      </div>
    </template>
  </div>
</template>
