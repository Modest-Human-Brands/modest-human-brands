<script setup lang="ts">
type Project = {
  slug: string
  title: string
  date: string
  status: 'Plan' | 'Quotation' | 'Shoot' | 'Edit' | 'Delivered'
  client: ProjectClient
  mediaCount: {
    photo: number
    video: number
  }
  previewImages: string[]
}

const props = defineProps<Project>()

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
        :width="72"
        :height="128"
        fit="cover"
        class="relative inline-block aspect-[9/16] rounded-lg object-cover"
        :style="{
          zIndex: idx,
        }" />
    </div>
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="font-semibold truncate text-xl text-white">
        {{ title }}
      </div>
      <NuxtTime :datetime="date" class="mt-1 text-base text-white" day="numeric" month="short" year="numeric" />
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-white/70">
        <div class="inline-flex items-center gap-2">
          <span class="size-3 rounded-full" :class="status === 'Delivered' ? 'bg-success-500' : 'bg-white/40'" />
          <span class="text-white/75">{{ status }}</span>
        </div>
        <div class="text-white/40">·</div>
        <div class="text-white/60">{{ mediaCount.photo }} Photos {{ mediaCount.video }} Videos</div>
      </div>
      <div class="flex items-center gap-2">
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
