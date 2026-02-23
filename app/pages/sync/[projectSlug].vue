<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: stream } = await useFetch<Stream[]>(`/api/stream/${slug}`)

const cover = stream.value?.poster ? extractCdnId(stream.value?.poster) : ''
</script>

<template>
  <section v-if="stream" class="relative size-full overflow-hidden">
    <NuxtVideo
      :poster="cover"
      :media="stream.media"
      :disable-picture-in-picture="true"
      :controls="true"
      controls-list="nodownload"
      :autoplay="true"
      :muted="true"
      :playsinline="true"
      preload="metadata"
      class="aspect-video h-fit max-h-full w-full min-w-fit max-w-7xl cursor-pointer object-contain"
      base-url="http://localhost:4620" />
  </section>
</template>
