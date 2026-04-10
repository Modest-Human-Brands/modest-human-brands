<script setup lang="ts">
import type { UseSwipeDirection } from '@vueuse/core'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const projectSlug = computed(() => route.params.projectSlug as string)
const mediaSlug = computed(() => route.params.mediaSlug as string)

const { data: project } = await useFetch(`/api/media/${projectSlug.value}`)

const mediaItems = computed(() => project.value?.mediaItems ?? [])
const currentIndex = computed(() => mediaItems.value.findIndex((m) => m.slug === mediaSlug.value))
const isFirst = computed(() => currentIndex.value <= 0)
const isLast = computed(() => currentIndex.value >= mediaItems.value.length - 1)
const currentItem = computed(() => mediaItems.value[currentIndex.value])

const backUrl = computed(() => `/drive/${projectSlug.value}`)

async function navigateToIndex(index: number) {
  const slug = mediaItems.value[index]?.slug
  if (slug) await router.push(`/drive/${projectSlug.value}/${slug}`)
}

async function prev() {
  return await (isFirst.value ? router.push(backUrl.value) : navigateToIndex(currentIndex.value - 1))
}

async function next() {
  return await (isLast.value ? router.push(backUrl.value) : navigateToIndex(currentIndex.value + 1))
}

onKeyStroke('Escape', () => router.push(backUrl.value))
onKeyStroke('ArrowLeft', prev)
onKeyStroke('ArrowRight', next)

const imageEl = ref<HTMLElement | null>(null)
onMounted(() => {
  useSwipe(imageEl, {
    passive: false,
    async onSwipeEnd(_e: TouchEvent, direction: UseSwipeDirection) {
      const finalDir = await (direction === 'left' ? next() : prev())
      return finalDir
    },
  })
})

const img = useImage()
</script>

<template>
  <section v-if="currentItem && currentItem.slug" class="relative flex h-screen w-screen overflow-hidden bg-dark-400">
    <div class="relative z-10 flex size-full flex-col md:flex-row">
      <MediaFlimstrip :project-slug="projectSlug" :media-items="mediaItems" :active-media-slug="currentItem.slug" vertical />

      <div class="flex flex-1 flex-col overflow-hidden" :style="{ aspectRatio: currentItem.metadata.aspectRatio }">
        <div class="flex h-12 shrink-0 items-center justify-between border-b border-white/5 px-4 backdrop-blur-sm">
          <NuxtLink :to="backUrl" class="flex items-center gap-1.5 text-white/50 transition-colors duration-200 hover:text-white">
            <NuxtIcon name="local:chevron-bold" class="text-[18px]" />
            <span class="text-sm font-semi-bold">Back</span>
          </NuxtLink>

          <span class="text-sm tabular-nums text-white/30"> {{ currentIndex + 1 }}&thinsp;/&thinsp;{{ mediaItems.length }} </span>
        </div>

        <div ref="mediaElem" class="relative flex flex-1 items-center justify-center overflow-hidden">
          <button
            type="button"
            class="absolute left-2 z-10 flex size-9 items-center justify-center rounded-full bg-dark-500/70 text-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-dark-400 hover:text-white disabled:opacity-0"
            :disabled="isFirst"
            aria-label="Previous"
            @click.prevent="prev">
            <NuxtIcon name="local:chevron-bold" class="text-[18px]" />
          </button>

          <Transition name="media-fade" mode="out-in">
            <div :key="currentItem.slug" class="relative flex h-auto max-h-full w-full max-w-full items-center justify-center landscape:h-full landscape:w-auto">
              <NuxtImg
                v-if="currentItem.type === 'photo'"
                :key="currentItem.slug"
                :src="extractCdnId(currentItem.thumbnailUrl!)"
                :alt="currentItem.title"
                height="100vh"
                loading="eager"
                preload
                :placeholder="img(extractCdnId(currentItem.thumbnailUrl!), { width: Math.round(240 * calculateAspectRatio(currentItem.metadata.aspectRatio)), height: 240, quality: 80 })"
                class="size-full object-contain shadow-2xl transition-opacity duration-300"
                @contextmenu.prevent />
              <NuxtVideo
                v-else
                ref="videoContainerRef"
                :poster="currentItem.thumbnailUrl"
                :media="currentItem.media"
                :aspect-ratio="currentItem.metadata.aspectRatio"
                :disable-picture-in-picture="true"
                :controls="true"
                controls-list="nodownload"
                :autoplay="true"
                :muted="true"
                :playsinline="true"
                preload="metadata"
                class="relative flex size-full cursor-pointer items-center justify-center" />
            </div>
          </Transition>

          <button
            type="button"
            class="absolute right-2 z-10 flex size-9 items-center justify-center rounded-full bg-dark-500/70 text-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-dark-400 hover:text-white disabled:opacity-0"
            :disabled="isLast"
            aria-label="Next"
            @click.prevent="next">
            <NuxtIcon name="local:chevron-bold" class="-scale-x-100 text-[18px]" />
          </button>
        </div>

        <MediaFlimstrip :project-slug="projectSlug" :media-items="mediaItems" :active-media-slug="currentItem.slug" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.media-fade-enter-active,
.media-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.media-fade-enter-from,
.media-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

@media (min-width: 768px) {
  .imageEl {
    view-transition-name: vtn-image;
  }
}
</style>
