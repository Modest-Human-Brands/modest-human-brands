<script setup lang="ts">
definePageMeta({
  layout: 'default',
  // middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const projectSlug = computed(() => route.params.projectSlug as string)
const mediaSlug = computed(() => route.params.mediaSlug as string)

// Fetch project to get siblings
const { data: project } = await useFetch(`/api/media/${projectSlug.value}`)

const siblings = computed(() => project.value?.mediaItems || [])
const item = computed(() => siblings.value.find((m) => m.slug === mediaSlug.value))
const currentIndex = computed(() => siblings.value.findIndex((m) => m.slug === mediaSlug.value))
const prevItem = computed(() => siblings.value[currentIndex.value - 1] ?? null)
const nextItem = computed(() => siblings.value[currentIndex.value + 1] ?? null)

function goTo(targetSlug: string) {
  router.push(`/drive/${projectSlug.value}/${targetSlug}`)
}

onKeyStroke('ArrowLeft', () => prevItem.value && goTo(prevItem.value.slug))
onKeyStroke('ArrowRight', () => nextItem.value && goTo(nextItem.value.slug))
onKeyStroke('Escape', () => router.push(`/drive/${projectSlug.value}`))

const swipeRef = useTemplateRef<HTMLDivElement>('swipe')

useSwipe(swipeRef, {
  onSwipeEnd(_, dir) {
    if (dir === 'left' && nextItem.value) goTo(nextItem.value.slug)
    if (dir === 'right' && prevItem.value) goTo(prevItem.value.slug)
  },
})

const filmstripItems = useTemplateRefsList<HTMLButtonElement>()

// Auto-scroll filmstrip to center active item
watch(
  currentIndex,
  async (newIndex) => {
    if (newIndex < 0) return
    await nextTick()

    filmstripItems.value[newIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  },
  { immediate: true }
)

const showInfo = ref(false)
</script>

<template>
  <div ref="swipe" class="fixed inset-0 z-50 flex flex-col bg-dark-600 font-main">
    <!-- Header -->
    <header class="z-20 grid shrink-0 grid-cols-3 items-center p-4 md:p-6">
      <!-- Left: Project Title -->
      <div class="hidden md:block">
        <h1 class="truncate text-[10px] uppercase tracking-[0.3em] text-light-500">
          {{ project?.title }}
        </h1>
      </div>

      <!-- Middle: Counter -->
      <div class="col-start-2 text-center">
        <p class="font-medium text-sm tracking-tighter text-white">{{ currentIndex + 1 }} <span class="mx-1 text-light-500">/</span> {{ siblings.length }}</p>
      </div>

      <!-- Right: Actions -->
      <div class="col-start-3 flex items-center justify-end gap-6">
        <button class="text-xs uppercase tracking-widest transition-colors" :class="showInfo ? 'text-white' : 'text-light-400 hover:text-white'" @click="showInfo = !showInfo">Info</button>

        <button class="text-xs uppercase tracking-widest text-light-400 transition-colors hover:text-white" @click="router.push(`/drive/${projectSlug}`)">Close</button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="relative flex flex-1 items-center justify-center overflow-hidden">
      <div v-if="!item" class="animate-pulse font-sub text-xs uppercase tracking-widest text-light-500">Loading...</div>

      <template v-else>
        <!-- Image / Video Element -->
        <NuxtImg
          v-if="item.type === 'photo'"
          :key="item.slug"
          :src="item.thumbnailUrl"
          :alt="item.title"
          class="max-h-full w-full max-w-full object-contain shadow-2xl transition-opacity duration-300 landscape:h-full" />

        <!-- Video Placeholder -->
        <div v-else class="relative flex h-full w-full items-center justify-center">
          <NuxtImg :src="item.thumbnailUrl" class="max-h-full max-w-full object-contain opacity-50 blur-sm" />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex size-20 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform hover:scale-110">
              <NuxtIcon name="local:play" class="translate-x-0.5 text-3xl text-white" />
            </div>
          </div>
        </div>

        <!-- Meta Overlay Panel -->
        <Transition name="slide-info">
          <div v-if="showInfo" class="absolute bottom-0 right-0 top-0 z-30 w-72 border-l border-white/5 bg-dark-500/95 p-8 shadow-2xl backdrop-blur-xl">
            <div class="mb-8">
              <span class="mb-2 block text-[10px] uppercase tracking-[0.2em] text-light-500">Filename</span>
              <h2 class="break-all text-lg font-regular leading-tight text-white">{{ item.title || item.slug }}</h2>
            </div>

            <div class="space-y-6">
              <div v-if="item.type">
                <span class="mb-1 block text-[9px] uppercase tracking-widest text-light-500">Type</span>
                <span class="text-xs uppercase text-white">{{ item.type }}</span>
              </div>
              <div v-if="item.metadata?.resolution">
                <span class="mb-1 block text-[9px] uppercase tracking-widest text-light-500">Resolution</span>
                <span class="text-xs text-white">{{ item.metadata.resolution }}</span>
              </div>
              <div v-if="item.metadata?.bitDepth">
                <span class="mb-1 block text-[9px] uppercase tracking-widest text-light-500">Color Depth</span>
                <span class="text-xs text-white">{{ item.metadata.bitDepth }}</span>
              </div>
              <div v-if="item.metadata?.size">
                <span class="mb-1 block text-[9px] uppercase tracking-widest text-light-500">File Size</span>
                <span class="text-xs text-white">{{ item.metadata.size }} MB</span>
              </div>
            </div>
          </div>
        </Transition>
      </template>
    </main>

    <!-- Filmstrip Bottom Slider -->
    <div class="pb-safe h-28 shrink-0 border-t border-white/5 bg-dark-600/50 backdrop-blur-md md:h-32">
      <div class="flex h-full items-center gap-3 overflow-x-auto scroll-smooth">
        <!-- Leading spacer to center active item -->
        <div class="w-[calc(50vw-48px)] shrink-0" />

        <button
          v-for="sibling in siblings"
          ref="filmstripItems"
          :key="sibling.slug"
          :data-slug="sibling.slug"
          class="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-sm transition-all duration-500 ease-out md:w-24"
          :class="sibling.slug === mediaSlug ? 'z-10 scale-110 opacity-100 shadow-xl shadow-black/50 ring-1 ring-white' : 'scale-90 opacity-30 hover:opacity-60'"
          @click="goTo(sibling.slug)">
          <NuxtImg :src="sibling.thumbnailUrl" :alt="sibling.slug" class="h-full w-full object-cover" loading="lazy" />

          <div v-if="sibling.type === 'video'" class="absolute inset-0 flex items-center justify-center bg-black/20">
            <NuxtIcon name="local:play" class="size-4 text-white" />
          </div>

          <!-- Active Indicator line -->
          <div v-if="sibling.slug === mediaSlug" class="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
        </button>

        <!-- Trailing spacer -->
        <div class="w-[calc(50vw-48px)] shrink-0" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filmstrip {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filmstrip::-webkit-scrollbar {
  display: none;
}

.slide-info-enter-active,
.slide-info-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-info-enter-from,
.slide-info-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
