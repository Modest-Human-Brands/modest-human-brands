<script setup lang="ts">
definePageMeta({
  layout: 'drive',
})

// const route = useRoute()
// const slug = route.params.projectSlug!.toString()

const makeMediaItem = (id: string, type: 'photo' | 'video', index: number): MediaItem => {
  const isVideo = type === 'video'

  return {
    id,
    type,
    title: isVideo
      ? 'Close-up of a black wallet on a wooden surface.'
      : index === 1
        ? 'Black minimalist leather wallet flat lay on wooden chess board'
        : index === 2
          ? 'Overhead view of slim black card holder on chess table'
          : index === 3
            ? 'Lifestyle photography of black smart wallet with whiskey glass'
            : index === 4
              ? 'Mens hands holding black minimalist wallet lifestyle shot'
              : index === 5
                ? 'Side profile of black smart wallet in hand showing slim design'
                : index === 6
                  ? 'Detail shot of money clip on back of black smart wallet'
                  : 'Slim black cardholder with cards inserted',
    fileCode: `${isVideo ? 'video' : 'photo'}-0054-000${index}-001`,
    thumbnailUrl: `https://picsum.photos/seed/media${id}/600/400`,
    metadata: {
      size: isVideo ? 228 : [16, 25, 28, 23, 25, 22, 18][index - 1] || 20,
      resolution: isVideo ? '1080p' : '4320p',
      bitDepth: '10 bit',
      fps: isVideo ? 30 : undefined,
    },
  }
}

const project: ProjectDetail = {
  id: 'proj-1',
  slug: 'anime-garment',
  title: 'Anime Garment',
  client: {
    name: 'True Mens',
    avatarUrl: 'https://picsum.photos/seed/client2/72/72',
  },
  status: {
    label: 'Delivered',
    delivered: true,
  },
  photosCount: 16,
  videosCount: 1,
  mediaItems: [
    makeMediaItem('m1', 'video', 0),
    makeMediaItem('m2', 'photo', 1),
    makeMediaItem('m3', 'photo', 2),
    makeMediaItem('m4', 'photo', 3),
    makeMediaItem('m5', 'photo', 4),
    makeMediaItem('m6', 'photo', 5),
    makeMediaItem('m7', 'photo', 6),
    makeMediaItem('m8', 'photo', 7),
    makeMediaItem('m9', 'photo', 8),
    makeMediaItem('m10', 'photo', 9),
    makeMediaItem('m11', 'photo', 10),
  ],
}
</script>

<template>
  <section class="relative flex h-full flex-1 flex-col overflow-hidden">
    <!-- ProjectHeader -->
    <div class="mt-8 grid grid-flow-col grid-cols-2 grid-rows-2 gap-3 text-base">
      <span class="text-xl">True Mens New Wallet</span>
      <span>Dec 22, 2025</span>
      <div class="flex items-center gap-2 justify-self-end">
        <NuxtImg :src="project.client.avatarUrl" :alt="project.client.name" :width="32" :height="32" class="size-8 rounded-full border border-black/50 object-cover" />
        <span class="truncate">{{ project.client.name }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 justify-self-end text-white/70">
        <div class="inline-flex items-center gap-2">
          <span class="size-3 rounded-full" :class="project.status.delivered ? 'bg-success-500' : 'bg-white/40'" />
          <span class="text-white/75">{{ project.status.label }}</span>
        </div>
        <span>·</span>
        <span>{{ project.photosCount }} Photos {{ project.videosCount }} Videos</span>
      </div>
    </div>
    <!-- MediaGrid -->
    <div class="mt-8 flex-1 overflow-y-auto">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MediaCard v-for="item in project.mediaItems" :key="item.id" v-bind="item" />
      </div>
    </div>
  </section>
</template>
