<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: stream } = await useFetch(`/api/stream/${slug}`)

const cover = stream.value?.poster ? extractCdnId(stream.value?.poster) : ''

const videoPlayerRef = useTemplateRef<{ videoRef: Ref<HTMLVideoElement> }>('videoPlayerRef')

function seekToEnd() {
  const video = videoPlayerRef.value?.videoRef.value
  if (!video) return
  video.currentTime = video.duration
}
</script>

<template>
  <section class="relative flex h-screen w-screen items-center justify-center overflow-hidden">
    <template v-if="!(stream && stream?.status === 'live')"> No Stream Stared Yet </template>
    <template v-else>
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
        class="aspect-video h-fit max-h-full w-full min-w-fit max-w-7xl cursor-pointer bg-black object-contain"
        @loadedmetadata="seekToEnd" />
    </template>
  </section>
</template>
