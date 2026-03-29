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
  <section v-if="currentItem && currentItem.slug" class="relative flex h-screen w-screen overflow-hidden bg-dark-600">
    <!-- layout: filmstrip left (desktop) | filmstrip bottom (mobile) -->
    <div class="relative z-10 flex size-full flex-col md:flex-row">
      <!-- desktop filmstrip — left vertical -->
      <MediaFlimstrip :project-slug="projectSlug" :media-items="mediaItems" :active-media-slug="currentItem.slug" vertical />

      <!-- main content -->
      <div class="flex flex-1 flex-col overflow-hidden" :style="{ aspectRatio: currentItem.metadata.aspectRatio }">
        <!-- top bar -->
        <div class="flex h-12 shrink-0 items-center justify-between border-b border-white/5 px-4 backdrop-blur-sm">
          <NuxtLink :to="backUrl" class="flex items-center gap-1.5 text-white/50 transition-colors duration-200 hover:text-white">
            <NuxtIcon name="local:chevron-bold" class="text-[18px]" />
            <span class="text-xs font-semi-bold">Back</span>
          </NuxtLink>

          <span class="text-2xs tabular-nums text-white/30"> {{ currentIndex + 1 }}&thinsp;/&thinsp;{{ mediaItems.length }} </span>
        </div>

        <!-- image area -->
        <div ref="imageEl" class="relative flex flex-1 items-center justify-center overflow-hidden">
          <!-- prev button -->
          <button
            type="button"
            class="absolute left-2 z-10 flex size-9 items-center justify-center rounded-full bg-dark-500/70 text-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-dark-400 hover:text-white disabled:opacity-0"
            :disabled="isFirst"
            aria-label="Previous"
            @click="prev">
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
                class="h-auto max-h-full w-full max-w-full object-contain shadow-2xl transition-opacity duration-300 landscape:h-full landscape:w-auto"
                @contextmenu.prevent />
              <div v-else class="relative flex h-auto max-h-full w-full items-center justify-center landscape:h-full landscape:w-auto">
                <NuxtVideo
                  ref="videoContainerRef"
                  :key="currentItem.slug"
                  :poster="currentItem.thumbnailUrl"
                  :media="currentItem.media"
                  :disable-picture-in-picture="true"
                  controls-list="nodownload"
                  :autoplay="true"
                  :muted="true"
                  :playsinline="true"
                  preload="metadata"
                  class="aspect-video cursor-pointer" />
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="flex size-20 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform hover:scale-110">
                    <NuxtIcon name="local:play" class="translate-x-0.5 text-3xl text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <!-- next button -->
          <button
            type="button"
            class="absolute right-2 z-10 flex size-9 items-center justify-center rounded-full bg-dark-500/70 text-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-dark-400 hover:text-white disabled:opacity-0"
            :disabled="isLast"
            aria-label="Next"
            @click="next">
            <NuxtIcon name="local:chevron-bold" class="-scale-x-100 text-[18px]" />
          </button>
        </div>

        <!-- mobile filmstrip — bottom horizontal -->
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

<style>
.scrollbar-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
</style>
