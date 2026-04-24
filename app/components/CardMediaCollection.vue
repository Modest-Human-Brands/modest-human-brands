<script setup lang="ts">
import { useShare } from '@vueuse/core'

const props = defineProps<{
  orgSlug: string
  mediaCollection: ProjectMediaCollection
  index: number
}>()

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

const galleryImages = computed(() => props.mediaCollection.previewImages?.slice(0, 4) || [])
</script>

<template>
  <NuxtLink
    :to="`/drive/${mediaCollection.slug}`"
    :style="{ animationDelay: `${index * 80}ms` }"
    class="animate-fade-in group relative block aspect-square w-full cursor-pointer overflow-hidden bg-dark-400 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50">
    <!-- Share Button: Minimalist Floating -->
    <button
      class="absolute right-3 top-3 z-30 flex size-9 items-center justify-center rounded-full bg-white/10 text-white opacity-0 blur-sm backdrop-blur-md transition-all duration-500 hover:bg-white hover:text-black group-hover:opacity-100 group-hover:blur-none"
      aria-label="Share Collection"
      @click="shareMedia">
      <NuxtIcon name="local:link" class="text-base" />
    </button>
    <div class="relative size-full overflow-hidden">
      <!-- Scenario A: Real Preview Images (Collage Look) -->
      <div v-if="galleryImages.length" class="flex size-full gap-0.5 md:gap-1">
        <!-- Main Large Thumbnail -->
        <div class="relative h-full flex-1 overflow-hidden">
          <NuxtImg
            :src="extractCdnId(galleryImages[0]!)"
            :alt="mediaCollection.title"
            :width="420"
            :height="Math.round(420 / (4 / 3))"
            sizes="50vw md:20vw 2xl:15vw"
            fit="cover"
            loading="lazy"
            :placeholder="[240, Math.round(240 / (4 / 3)), 50, 5]"
            class="size-full bg-dark-600 object-cover transition-transform duration-1000 ease-out group-hover:scale-110" />
        </div>
        <!-- Side Thumbnails (Stack) -->
        <div v-if="galleryImages.length > 1" class="flex h-full w-1/3 flex-col gap-0.5 md:gap-1">
          <div v-for="(image, i) in galleryImages.slice(1)" :key="i" class="relative flex-1 overflow-hidden">
            <NuxtImg
              :src="extractCdnId(image)"
              :alt="mediaCollection.title"
              :width="140"
              :height="Math.round(140 / (4 / 3))"
              sizes="18vw md:8vw 2xl:5vw"
              fit="cover"
              loading="lazy"
              :placeholder="[70, Math.round(70 / (4 / 3)), 50, 5]"
              class="size-full bg-dark-600 object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />
          </div>
          <!-- Placeholder if less than 4 images to keep grid balanced -->
          <div v-if="galleryImages.length < 4 && galleryImages.length > 1" class="flex flex-1 items-center justify-center bg-white/5">
            <span class="text-xs text-white/20">...</span>
          </div>
        </div>
      </div>
      <!-- Scenario B: Minimal Empty State -->
      <div v-else class="absolute inset-0 flex flex-col items-center justify-center bg-dark-600/50">
        <div class="flex flex-col items-center opacity-20 transition-opacity duration-500 group-hover:opacity-40">
          <NuxtIcon name="local:image" class="mb-2 text-3xl" />
          <span class="text-xs font-light uppercase tracking-[0.4em]">Empty</span>
        </div>
      </div>
      <!-- Overlay Gradients for legibility -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black" />
    </div>
    <div class="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
      <!-- Title Area: Persistent but shifts on hover -->
      <div class="transform transition-all duration-500 group-hover:-translate-y-1">
        <h2 class="line-clamp-2 text-sm font-regular leading-tight text-white drop-shadow-lg md:text-lg">
          {{ mediaCollection.title }}
        </h2>
        <!-- Status dot: Always visible but tiny -->
        <div class="mt-1.5 flex items-center gap-2">
          <span class="size-1.5 rounded-full" :class="mediaCollection.status === 'Delivered' ? 'bg-success-500' : 'bg-white/30'" />
          <span class="text-xs uppercase tracking-widest text-white/50">
            {{ mediaCollection.status || 'Draft' }}
          </span>
        </div>
      </div>
      <div class="max-h-0 translate-y-4 overflow-hidden border-t border-white/10 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:translate-y-0 group-hover:opacity-100">
        <div class="flex items-center justify-between">
          <div class="flex min-w-0 items-center gap-2">
            <NuxtImg
              v-if="mediaCollection.client?.avatar"
              :src="extractCdnId(mediaCollection.client.avatar)"
              fit="cover"
              loading="lazy"
              class="size-5 rounded-full object-cover ring-1 ring-white/20" />
            <p class="text-xxs truncate font-light uppercase tracking-widest text-white/70">
              {{ mediaCollection.client?.name || 'Client' }}
            </p>
          </div>
          <div class="flex items-baseline gap-1 text-white">
            <span class="text-xl font-light">
              {{ (mediaCollection.mediaCount?.photo || 0) + (mediaCollection.mediaCount?.video || 0) }}
            </span>
            <span class="text-xs uppercase tracking-tighter text-white/40">items</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
