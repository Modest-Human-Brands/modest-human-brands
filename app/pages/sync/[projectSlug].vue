<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: stream, refresh } = await useFetch<ProjectStream>(`/api/stream/${slug}`)

const cover = computed(() => (stream.value?.poster ? extractCdnId(stream.value.poster) : ''))

async function startStream() {
  stream.value!.status = StreamStatus.Starting
  const deviceId = 'front-camera'
  await $fetch(`/api/stream/${slug}`, { method: 'POST', body: { deviceId } })
  await refresh()
}
</script>

<template>
  <section class="relative size-full overflow-hidden">
    {{ stream?.status }}
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
        :controls="true"
        controls-list="nodownload"
        :autoplay="true"
        :muted="true"
        :playsinline="true"
        preload="metadata"
        class="aspect-video h-fit max-h-full w-full min-w-fit max-w-7xl cursor-pointer bg-black object-contain" />
    </template>
    <template v-else>
      <div class="flex size-full flex-col items-center justify-center gap-4">
        <button type="button" class="font-medium inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-black transition hover:bg-white/90" @click="startStream">
          <!-- <NuxtIcon name="local:broadcast" class="text-[18px]" /> -->
          Start Stream
        </button>
      </div>
    </template>
  </section>
</template>
