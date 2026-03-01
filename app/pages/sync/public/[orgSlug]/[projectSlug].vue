<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: stream } = await useFetch<ProjectStream>(`/api/stream/${slug}`)

const cover = computed(() => (stream.value?.poster ? extractCdnId(stream.value.poster) : ''))

const videoPlayer = useTemplateRef<{ videoRef: Ref<HTMLVideoElement>; seekToLive: () => void }>('videoPlayer')

const isAtLive = ref(true)

function goLive() {
  videoPlayer.value?.seekToLive()
}
</script>

<template>
  <section class="relative size-full overflow-hidden">
    <template v-if="stream?.status === StreamStatus.Starting">
      <div class="flex size-full flex-col items-center justify-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p class="text-neutral-400 text-sm">Stream is starting...</p>
      </div>
    </template>
    <template v-else-if="stream?.status === StreamStatus.Live">
      <div class="relative grid size-full grid-cols-6 grid-rows-4 md:grid-cols-4">
        <NuxtVideo
          ref="videoPlayer"
          :poster="cover"
          :media="stream.media"
          :live="true"
          :disable-picture-in-picture="true"
          controls-list="nodownload"
          :autoplay="true"
          :muted="true"
          :playsinline="true"
          preload="metadata"
          class="col-span-full row-span-3 aspect-[4/3] h-fit cursor-pointer bg-black object-cover md:col-span-3"
          @at-live="isAtLive = $event" />

        <div class="absolute left-3 top-3 flex items-center gap-2">
          <button class="flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm" :class="[isAtLive ? 'bg-alert-500' : 'bg-dark-500']" @click="goLive">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" :class="[isAtLive ? 'bg-white' : 'bg-alert-400']" />
              <span class="relative inline-flex h-2 w-2 rounded-full" :class="[isAtLive ? 'bg-white' : 'bg-alert-500']" />
            </span>
            <span class="font-semibold text-xs uppercase tracking-wider text-white">Live</span>
          </button>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex size-full flex-col items-center justify-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p class="text-neutral-400 text-sm">Stream yet not stared please wait...</p>
      </div>
    </template>
  </section>
</template>
