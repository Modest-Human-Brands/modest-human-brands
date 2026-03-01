<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: medias } = await useFetch(`/api/media`)
const orgSlug = 'red-cat-pictures'
</script>

<template>
  <section class="relative flex h-full overflow-hidden">
    <template v-if="!medias?.length"> No Project Details Found </template>
    <template v-else>
      <div class="flex flex-1 flex-col items-stretch gap-4 overflow-y-auto">
        <CardMediaCollection v-for="media in medias" :key="media.slug" :org-slug="orgSlug" :media-collection="media" />
      </div>
    </template>
  </section>
</template>
