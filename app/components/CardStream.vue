<script setup lang="ts">
interface ProjectStream {
  slug: string
  title: string
  rtmpUrl: string
  media: string
  poster: string
  streamKey: string
  deviceId: string
  isLive: boolean
  client?: ProjectClient
}

defineProps<ProjectStream>()
</script>

<template>
  <NuxtLink
    :to="`/sync/${slug}`"
    class="bg-neutral-800/60 hover:bg-neutral-800 group flex cursor-pointer overflow-hidden rounded-xl border border-white/5 transition-all duration-200 hover:border-white/15">
    <div class="relative shrink-0 overflow-hidden">
      <NuxtImg :src="poster" :alt="title" class="aspect-video h-44 object-cover transition-transform duration-300 group-hover:scale-105" />
      <span v-if="isLive" class="font-medium absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm"> Live </span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col justify-between p-4">
      <div class="space-y-2.5">
        <h3 class="font-semibold line-clamp-2 text-[15px] leading-snug text-white">
          {{ title }}
        </h3>
        <div v-if="client" class="flex items-center gap-2">
          <img :src="client.avatar" :alt="client.name" class="h-5 w-5 rounded-full object-cover" />
          <span class="text-neutral-400 text-sm">{{ client.name }}</span>
        </div>
      </div>

      <div class="text-neutral-500 mt-4 flex items-center gap-4 text-sm">
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="local:eye" class="text-[16px]" />
          100
          <!-- {{ views }} -->
        </span>
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="local:hour" class="text-[16px]" />
          01:00
          <!-- {{ duration }} -->
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
