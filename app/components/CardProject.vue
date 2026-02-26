<script setup lang="ts">
type ProjectMediaCollection = {
  slug: string
  title: string
  date: string
  status: ProjectStatus
  client?: ProjectClient
  mediaCount: {
    photo: number
    video: number
  }
  previewImages: string[]
}

const props = defineProps<ProjectMediaCollection>()

const previewImagesShown = computed(() => props.previewImages.slice(0, 4))

const { share, isSupported } = useShare()

function shareMedia(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  const url = `${window.location.origin}/public/sync/${props.slug}`
  if (isSupported.value) {
    share({ title: props.title, url })
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <NuxtLink :to="`/drive/${slug}`" class="group flex items-start gap-2 rounded bg-dark-500 p-2 text-white md:gap-4 md:rounded-2xl md:p-4">
    <div class="relative -space-x-10">
      <NuxtImg
        v-for="(src, idx) in previewImagesShown"
        :key="src"
        :src="src"
        :alt="title"
        :width="128"
        :height="171"
        fit="cover"
        class="relative inline-block aspect-[3/4] w-[3.125rem] rounded-lg object-cover md:w-20"
        :style="{ zIndex: idx }" />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="font-semibold truncate text-sm text-white md:text-xl">{{ title }}</div>

      <NuxtTime :datetime="date" class="text-2xs text-white md:text-base" day="numeric" month="short" year="numeric" />

      <div class="flex items-center gap-2 text-2xs text-white/70 md:gap-3 md:text-base">
        <div class="inline-flex items-center gap-2">
          <span class="size-3 rounded-full" :class="status === 'Delivered' ? 'bg-success-500' : 'bg-white/40'" />
          <span class="text-white/75">{{ status }}</span>
        </div>
        <div class="text-white/40">·</div>
        <div class="text-white/60">{{ mediaCount.photo }} Photos {{ mediaCount.video }} Videos</div>
      </div>

      <div class="flex w-full justify-between">
        <div v-if="client" class="flex min-w-0 items-center gap-2">
          <NuxtImg v-if="client.avatar" :src="client.avatar" :alt="client.name" :width="32" :height="32" class="size-5 shrink-0 rounded-full object-cover md:size-8" />
          <span class="truncate text-2xs text-white/75 md:text-base">{{ client.name }}</span>
        </div>
        <!-- Share button -->
        <button type="button" class="bg-neutral-700 hover:bg-neutral-600 ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white/80 md:hidden" @click="shareMedia">
          <NuxtIcon name="local:link" class="text-[16px]" />
          Share
        </button>
      </div>
    </div>
    <!-- Share button -->
    <button
      type="button"
      class="bg-neutral-700 hover:bg-neutral-600 mr-3 hidden shrink-0 items-center gap-2 self-center rounded-full px-4 py-2 text-sm text-white/80 md:inline-flex"
      @click="shareMedia">
      <NuxtIcon name="local:link" class="text-[24px]" />
      Share
    </button>
  </NuxtLink>
</template>
