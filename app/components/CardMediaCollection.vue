<script setup lang="ts">
const props = defineProps<{ orgSlug: string; mediaCollection: ProjectMediaCollection }>()

const previewImagesShown = computed(() => props.mediaCollection.previewImages.slice(0, 4))

const { share, isSupported } = useShare()

function shareMedia(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  const url = `${window.location.origin}/drive/public/${props.orgSlug}/${props.mediaCollection.slug}`
  if (isSupported.value) {
    share({ title: props.mediaCollection.title, url })
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <NuxtLink :to="`/drive/${mediaCollection.slug}`" class="group flex items-start gap-2 rounded bg-dark-500 p-2 text-white md:gap-4 md:rounded-2xl md:p-4">
    <div class="relative -space-x-10">
      <NuxtImg
        v-for="(src, idx) in previewImagesShown"
        :key="src"
        :src="src"
        :alt="mediaCollection.title"
        :width="128"
        :height="171"
        fit="cover"
        class="relative inline-block aspect-[3/4] w-[3.125rem] rounded-lg object-cover md:w-20"
        :style="{ zIndex: idx }" />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="font-semibold truncate text-sm text-white md:text-xl">{{ mediaCollection.title }}</div>

      <NuxtTime :datetime="mediaCollection.date" class="text-2xs text-white md:text-base" day="numeric" month="short" year="numeric" />

      <div class="flex items-center gap-2 text-2xs text-white/70 md:gap-3 md:text-base">
        <div class="inline-flex items-center gap-2">
          <span class="size-3 rounded-full" :class="mediaCollection.status === 'Delivered' ? 'bg-success-500' : 'bg-white/40'" />
          <span class="text-white/75">{{ mediaCollection.status }}</span>
        </div>
        <div class="text-white/40">·</div>
        <div class="text-white/60">{{ mediaCollection.mediaCount.photo }} Photos {{ mediaCollection.mediaCount.video }} Videos</div>
      </div>

      <div class="flex w-full justify-between">
        <div v-if="mediaCollection.client" class="flex min-w-0 items-center gap-2">
          <NuxtImg
            v-if="mediaCollection.client.avatar"
            :src="mediaCollection.client.avatar"
            :alt="mediaCollection.client.name"
            :width="32"
            :height="32"
            class="size-5 shrink-0 rounded-full object-cover md:size-8" />
          <span class="truncate text-2xs text-white/75 md:text-base">{{ mediaCollection.client.name }}</span>
        </div>
        <!-- Share button -->
        <button type="button" class="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-dark-400 px-2 py-0.5 text-xs text-white/80 hover:bg-dark-600 md:hidden" @click="shareMedia">
          <NuxtIcon name="local:link" class="text-[16px]" />
          Share
        </button>
      </div>
    </div>
    <!-- Share button -->
    <button type="button" class="mr-3 hidden shrink-0 items-center gap-2 self-center rounded-full bg-dark-400 px-4 py-2 text-sm text-white/80 hover:bg-dark-600 md:inline-flex" @click="shareMedia">
      <NuxtIcon name="local:link" class="text-[24px]" />
      Share
    </button>
  </NuxtLink>
</template>
