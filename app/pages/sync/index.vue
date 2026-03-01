<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: streams } = await useFetch('/api/stream')
const orgSlug = 'red-cat-pictures'
</script>

<template>
  <section class="relative flex h-full overflow-hidden">
    <template v-if="!streams?.length"> No Streams Found </template>
    <template v-else>
      <div class="grid flex-1 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2 md:gap-3">
        <CardStreamCollection v-for="stream in streams" :key="stream.slug" :org-slug="orgSlug" :stream-collection="stream" />
      </div>
    </template>
  </section>
</template>
