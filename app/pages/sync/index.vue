<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: streams } = await useFetch<Stream[]>('/api/stream')
</script>

<template>
  <section class="flex-1 overflow-y-auto px-6 pb-6">
    <div class="grid grid-cols-2 gap-3">
      <CardStream v-for="stream in streams" :key="stream.slug" v-bind="stream" />
    </div>
  </section>
</template>
