<script setup lang="ts">
import type { MediaMetadata } from '~~/shared/types/project'

type MediaItem = {
  slug: string
  type: MediaType
  title: string
  thumbnailUrl?: string
  metadata: MediaMetadata
}

const props = defineProps<MediaItem>()

const formatSize = (mb: number) => `${mb} MB`

const metadataIcons = ['local:database', 'local:downscale', 'local:mountain', 'local:keyframes'] as const

const metadataItems = computed(() => {
  const items: {
    value: string
    icon: string
  }[] = [
    { value: formatSize(props.metadata.size), icon: metadataIcons[0] },
    { value: props.metadata.resolution, icon: metadataIcons[1] },
    { value: props.metadata.bitDepth, icon: metadataIcons[2] },
  ]

  if (props.metadata.fps) {
    items.push({
      value: `${props.metadata.fps} FPS`,
      icon: metadataIcons[3],
    })
  }

  return items
})
</script>

<template>
  <article class="group relative overflow-hidden rounded-lg bg-dark-500 text-white transition">
    <div class="relative overflow-hidden">
      <NuxtImg :src="thumbnailUrl" :alt="title" class="aspect-video size-full object-contain transition-transform duration-300 group-hover:scale-105" />
      <div class="absolute left-2 top-2">
        <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semi-bold capitalize text-white backdrop-blur-sm">
          {{ type }}
        </span>
      </div>
      <button type="button" class="absolute bottom-2 right-2 grid rounded-full bg-white/10 p-1 text-white backdrop-blur-sm" aria-label="Download">
        <NuxtIcon name="local:download" class="text-[16px]" />
      </button>
    </div>
    <div class="p-4">
      <h3 class="line-clamp-2 text-sm font-semi-bold leading-relaxed text-white">
        {{ title }}
      </h3>
      <p class="mt-2 text-xs text-light-400">
        {{ slug }}
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-light-400">
        <div v-for="item in metadataItems" :key="item.value" class="flex items-center gap-0.5">
          <NuxtIcon :name="item.icon" class="text-[16px]" />
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>
  </article>
</template>
