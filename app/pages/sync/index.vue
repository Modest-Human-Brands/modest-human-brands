<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: streams } = await useFetch<Stream[]>('/api/stream')
</script>

<template>
  <section class="relative flex h-full overflow-hidden">
    <template v-if="!streams?.length"> No Streams Found </template>
    <template v-else>
      <div class="grid flex-1 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2 md:gap-3">
        <CardStream v-for="stream in streams" :key="stream.slug" v-bind="stream" />
      </div>
    </template>
  </section>
</template>
