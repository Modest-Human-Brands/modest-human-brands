<script setup lang="ts">
type DriveFolder = {
  slug: string
  title: string
  dateLabel: string
  status: {
    label: string
    delivered: boolean
  }
  photosCount: number
  videosCount: number
  client: ProjectClient
  previewImages: string[]
}

const props = defineProps<DriveFolder>()

const previewImagesShown = computed(() => props.previewImages.slice(0, 4))
</script>

<template>
  <NuxtLink :to="`/drive/${slug}`" class="group flex items-start gap-4 rounded-2xl bg-dark-500 p-4 text-white">
    <div class="relative shrink-0 -space-x-11">
      <NuxtImg
        v-for="(src, idx) in previewImagesShown"
        :key="src"
        :src="src"
        :alt="title"
        :width="70"
        :height="105"
        fit="cover"
        class="relative inline-block aspect-[9/16] h-full rounded-lg object-cover"
        :style="{
          zIndex: idx,
        }" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="font-semibold truncate text-xl text-white">
        {{ title }}
      </div>
      <NuxtTime :datetime="dateLabel" class="mt-1 text-base text-white" day="numeric" month="short" year="numeric" />
      <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-white/70">
        <div class="inline-flex items-center gap-2">
          <span class="size-3 rounded-full" :class="status.delivered ? 'bg-success-500' : 'bg-white/40'" />
          <span class="text-white/75">{{ status.label }}</span>
        </div>
        <div class="text-white/40">·</div>
        <div class="text-white/60">{{ photosCount }} Photos {{ videosCount }} Videos</div>
      </div>
      <div class="mt-2 flex items-center gap-2">
        <NuxtImg :src="client.avatarUrl" :alt="client.name" :width="32" :height="32" class="size-8 rounded-full object-cover" />
        <span class="truncate text-base text-white/75">{{ client.name }}</span>
      </div>
    </div>
    <button type="button" class="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-dark-400 px-4 py-2 text-xs text-white/80 hover:bg-dark-400/15">
      <NuxtIcon name="local:link" class="text-[24px]" />
      Share
    </button>
  </NuxtLink>
</template>
