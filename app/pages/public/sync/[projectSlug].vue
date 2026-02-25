<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: stream } = await useFetch<Stream[]>(`/api/stream/${slug}`)

const cover = stream.value?.poster ? extractCdnId(stream.value?.poster) : ''

const videoPlayerRef = useTemplateRef<{ videoRef: Ref<HTMLVideoElement> }>('videoPlayerRef')

function seekToEnd() {
  const video = videoPlayerRef.value?.videoRef.value
  if (!video) return
  video.currentTime = video.duration
}
</script>

<template>
  <section v-if="stream" class="relative flex h-screen w-screen items-center justify-center overflow-hidden">
    <NuxtVideo
      :poster="cover"
      :media="stream.media"
      :disable-picture-in-picture="true"
      controls-list="nodownload"
      :autoplay="true"
      :muted="true"
      :playsinline="true"
      preload="metadata"
      class="aspect-video h-fit max-h-full w-full min-w-fit max-w-7xl cursor-pointer bg-black object-contain"
      @loadedmetadata="seekToEnd" />
  </section>
</template>
