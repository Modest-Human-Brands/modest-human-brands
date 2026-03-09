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
      <div class="flex flex-1 flex-col items-center overflow-y-auto ">
        <CardStreamCollection v-for="stream in streams" :key="stream.slug" :org-slug="orgSlug"
          :stream-collection="stream" />
      </div>
    </template>
  </section>
</template>
