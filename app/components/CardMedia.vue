<script setup lang="ts">
import type { MediaMetadata, MediaType } from '~~/shared/types/project'

type MediaItem = {
  slug: string
  type: MediaType
  title: string
  thumbnailUrl?: string
  metadata: MediaMetadata
}

const props = defineProps<{
  projectSlug: string
  isPublic?: boolean
  status?: 'approved' | 'rejected'
  media: MediaItem
}>()

const emit = defineEmits<{ update: [value: 'approved' | 'rejected'] }>()

const aspectRatio = computed(() => props.media.metadata.aspectRatio.replace(':', '/'))

const metadataItems = computed(() => {
  const { size, resolution, bitDepth, fps, aspectRatio: ar } = props.media.metadata
  const items = [
    { value: `${size} MB`, icon: 'local:database' },
    { value: resolution, icon: 'local:downscale' },
    { value: ar, icon: 'local:mountain' },
    { value: bitDepth, icon: 'local:keyframes' },
  ]
  if (fps) items.push({ value: `${fps} fps`, icon: 'local:stream' })
  return items
})

async function onDownload(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (!props.media.thumbnailUrl) return

  const blob = await $fetch<Blob>(props.media.thumbnailUrl, { responseType: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.media.slug}.${props.media.type === 'video' ? 'mp4' : 'jpg'}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <NuxtLink
    :to="`/drive/${projectSlug}/${media.slug}`"
    class="group relative w-full cursor-pointer overflow-hidden"
    :class="{
      'ring-1 ring-success-500': isPublic && status === 'approved',
      'ring-1 ring-alert-500': isPublic && status === 'rejected',
    }"
    :style="{ aspectRatio }">
    <NuxtImg
      :src="extractCdnId(media.thumbnailUrl)"
      :alt="media.title"
      :width="420"
      :height="Math.round(420 / calculateAspectRatio(media.metadata.aspectRatio))"
      sizes="50vw md:25vw 2xl:16vw"
      fit="cover"
      loading="lazy"
      :placeholder="[120, Math.round(120 / calculateAspectRatio(media.metadata.aspectRatio)), 50, 5]"
      class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      @contextmenu.prevent />

    <div class="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <!-- top-left: status badge (public) OR type badge (private) -->
    <div class="absolute left-1.5 top-1.5 z-10">
      <div v-if="isPublic && status" class="flex size-5 items-center justify-center rounded-full fill-black md:size-6" :class="status === 'approved' ? 'bg-success-400' : 'bg-alert-400'">
        <NuxtIcon :name="status === 'approved' ? 'local:check' : 'local:cross'" class="size-2.5 text-dark-600 md:size-3" />
      </div>
      <span v-else-if="!isPublic" class="rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-semi-bold capitalize text-white backdrop-blur-sm">
        {{ media.type }}
      </span>
    </div>

    <!-- top-right: approve/reject (public) OR download (private) -->
    <div class="absolute right-1.5 top-1.5 z-10 md:right-2 md:top-2">
      <div v-if="isPublic" class="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          class="flex size-6 items-center justify-center rounded-full bg-black/50 transition-all duration-150"
          :class="status === 'approved' ? 'fill-success-500' : 'hover:fill-success-500'"
          @click.prevent.stop="emit('update', 'approved')">
          <NuxtIcon name="local:check" class="size-3" />
        </button>
        <button
          class="flex size-6 items-center justify-center rounded-full bg-black/50 transition-all duration-150"
          :class="status === 'rejected' ? 'fill-alert-500' : 'hover:fill-alert-500'"
          @click.prevent.stop="emit('update', 'rejected')">
          <NuxtIcon name="local:cross" class="size-3" />
        </button>
      </div>
      <button
        v-else
        type="button"
        class="flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all duration-150 hover:bg-black/70 group-hover:opacity-100 md:size-7"
        aria-label="Download"
        @click="onDownload">
        <NuxtIcon name="local:download" class="size-3 md:size-3.5" />
      </button>
    </div>

    <!-- video play -->
    <div v-if="media.type === 'video'" class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="flex size-9 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20 backdrop-blur-sm md:size-11">
        <NuxtIcon name="local:play" class="size-4 translate-x-px text-white md:size-5" />
      </div>
    </div>

    <!-- slide-up metadata bar -->
    <div class="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-4 transition-transform duration-300 group-hover:translate-y-0">
      <p class="truncate text-xs font-semi-bold leading-none text-white">{{ media.title }}</p>
      <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <div v-for="item in metadataItems" :key="item.value" class="flex items-center gap-0.5 text-light-500">
          <NuxtIcon :name="item.icon" class="text-[14px]" />
          <span class="text-xs leading-none">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
