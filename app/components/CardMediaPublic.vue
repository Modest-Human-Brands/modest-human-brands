<script setup lang="ts">
const props = defineProps<{ projectSlug: string; media: MediaItem; status?: 'approved' | 'rejected' }>()
const emit = defineEmits<{ update: [value: 'approved' | 'rejected'] }>()

const aspectRatio = computed(() => props.media.metadata.aspectRatio.replace(':', '/'))
</script>

<template>
  <!-- :class="{ 'ring-1 ring-success-500': status === 'approved', 'ring-1 ring-alert-500': status === 'rejected' }" -->
  <NuxtLink :to="`/drive/${projectSlug}/${media.slug}`" class="group relative w-full cursor-pointer overflow-hidden" :style="{ aspectRatio }">
    <NuxtImg :src="media.thumbnailUrl" :alt="media.title" class="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" fit="cover" />
    <div class="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <!-- Persistent status badge (top-left) -->
    <div
      v-if="status"
      class="absolute left-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full fill-black sm:size-6"
      :class="status === 'approved' ? 'bg-success-400' : 'bg-alert-400'">
      <NuxtIcon :name="status === 'approved' ? 'local:check' : 'local:cross'" class="size-2.5 text-dark-600 sm:size-3" />
    </div>

    <div class="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:right-2 sm:top-2">
      <button
        class="flex size-6 items-center justify-center rounded-full bg-black/50 transition-all duration-150"
        :class="status === 'approved' ? 'fill-success-500' : 'hover:fill-success-500'"
        @click.stop="emit('update', 'approved')">
        <NuxtIcon name="local:check" class="size-3" />
      </button>
      <button
        class="flex size-6 items-center justify-center rounded-full bg-black/50 transition-all duration-150"
        :class="status === 'rejected' ? 'fill-alert-500' : 'hover:fill-alert-500'"
        @click.stop="emit('update', 'rejected')">
        <NuxtIcon name="local:cross" class="size-3" />
      </button>
    </div>
    <div v-if="media.type === 'video'" class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="flex size-9 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20 backdrop-blur-sm sm:size-11">
        <NuxtIcon name="local:play" class="size-4 translate-x-px text-white sm:size-5" />
      </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 transition-transform duration-300 group-hover:translate-y-0">
      <p class="truncate text-3xs leading-none text-light-500">
        {{ media.metadata.resolution }}
        <span v-if="media.type === 'video' && media.metadata.fps">&bull; {{ media.metadata.fps }}fps</span>
      </p>
    </div>
  </NuxtLink>
</template>
