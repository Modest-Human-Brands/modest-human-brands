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
    <template v-if="stream?.status === StreamStatus.Starting">
      <div class="flex size-full flex-col items-center justify-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p class="text-neutral-400 text-sm">Stream is starting...</p>
      </div>
    </template>
    <template v-else-if="stream?.status === StreamStatus.Live">
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
    </template>
    <template v-else>
      <div class="flex size-full flex-col items-center justify-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p class="text-neutral-400 text-sm">Stream yet not stared please wait...</p>
      </div>
    </template>
  </section>
</template>
