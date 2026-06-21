<script setup lang="ts">
import { VuePDF } from '@tato30/vue-pdf'

const props = defineProps<{
  src: string
  isLoading?: boolean
  doc?: {
    id: string
    name: string
    previewUrl: string
  }
}>()

const { pdf, pages } = usePdfViewer(() => props.src)

const viewerState = reactive({
  page: 1,
  scale: 1,
  rotation: 0,
})

defineExpose({ pdf, pages, zoomIn, zoomOut, resetZoom, rotate, setPage, viewerState })

const config = useRuntimeConfig()

const viewerContainer = ref<HTMLElement>()
const { width: containerWidth, height: containerHeight } = useElementSize(viewerContainer)
const baseScale = ref(1)
const pdfViewportHeight = ref(792)

watch([pdf, containerWidth, containerHeight], async () => {
  if (!pdf.value || !containerHeight.value || !containerWidth.value) return
  try {
    const docObj = await pdf.value.promise
    const pageObj = await docObj.getPage(1)
    const viewport = pageObj.getViewport({ scale: 1, rotation: viewerState.rotation })
    pdfViewportHeight.value = viewport.height

    const scaleHeight = (containerHeight.value - 64) / viewport.height
    const scaleWidth = (containerWidth.value - 64) / viewport.width
    baseScale.value = Math.min(scaleWidth, scaleHeight)
  } catch {
    //
  }
})

const computedScale = computed(() => baseScale.value * viewerState.scale)

function setPage(p: number) {
  document.getElementById(`pdf-page-${p}`)?.scrollIntoView({ behavior: 'smooth' })
}

function onScroll(e: Event) {
  const target = e.target as HTMLElement
  if (!pages.value || pages.value <= 1) {
    viewerState.page = 1
    return
  }
  const maxScroll = target.scrollHeight - target.clientHeight
  if (maxScroll <= 0) return
  const scrollProgress = target.scrollTop / maxScroll
  const calculatedPage = Math.round(scrollProgress * (pages.value - 1)) + 1
  viewerState.page = Math.min(Math.max(1, calculatedPage), pages.value)
}

function zoomIn() {
  viewerState.scale += 0.05
}
function zoomOut() {
  if (viewerState.scale > 0.3) viewerState.scale -= 0.05
}
function resetZoom() {
  viewerState.scale = 1
}
function rotate() {
  viewerState.rotation = (viewerState.rotation + 90) % 360
}
</script>

<template>
  <div class="relative flex h-full w-full flex-1 flex-col overflow-hidden">
    <slot name="header" />

    <div ref="viewerContainer" class="scrollbar-hidden relative flex h-full w-full flex-col items-center overflow-y-auto p-4 pb-32 md:p-6" @scroll="onScroll">
      <div v-if="isLoading || (!pdf && props.src)" class="m-auto flex flex-col items-center gap-4 text-light-500">
        <NuxtIcon name="local:loader" class="animate-spin text-4xl" />
        <span class="text-sm font-bold uppercase tracking-widest">Loading Secure Document...</span>
      </div>

      <div v-else-if="pdf && pages" class="flex w-full flex-col items-center gap-8 pb-28 transition-all duration-300">
        <ClientOnly>
          <div v-for="p in pages" :id="`pdf-page-${p}`" :key="p" class="relative inline-block bg-white shadow-xl" style="line-height: 0">
            <VuePDF :pdf="pdf" :page="p" :scale="computedScale" :rotation="viewerState.rotation" />

            <slot name="page-overlay" :page="p" :scale="computedScale" :viewport-height="pdfViewportHeight" :total-pages="pages" />
          </div>
        </ClientOnly>
      </div>
    </div>

    <div v-if="pdf && pages" class="absolute bottom-[128px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-dark-400 px-6 py-3 text-white md:bottom-6">
      <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="setPage(Math.max(1, viewerState.page - 1))">
        <NuxtIcon name="local:chevron-bold" class="text-lg" />
      </button>
      <span class="w-16 text-center text-xs font-bold text-light-400">{{ viewerState.page }} / {{ pages }}</span>
      <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="setPage(Math.min(pages || 1, viewerState.page + 1))">
        <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-lg" />
      </button>
      <div class="h-4 w-px bg-white/20" />

      <button type="button" class="transition-colors hover:text-primary-500" @click="zoomIn">
        <NuxtIcon name="local:plus" class="text-lg" />
      </button>
      <button type="button" class="transition-colors hover:text-primary-500" @click="zoomOut">
        <NuxtIcon name="local:minus" class="text-lg" />
      </button>
      <button v-if="viewerState.scale !== 1" type="button" class="text-xs font-bold text-light-500 transition-colors hover:text-white" @click="resetZoom">Reset</button>

      <slot name="toolbar-actions" />

      <NuxtLink
        v-if="doc"
        :to="`/connect/share?docId=${doc.id}&title=${encodeURIComponent(doc.name)}`"
        class="font-semibold flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-dark-400 px-4 py-1.5 text-xs text-primary-400 transition-colors hover:bg-dark-500 hover:text-primary-500">
        <NuxtIcon name="local:connect" class="text-sm" /> Share
      </NuxtLink>

      <div class="hidden h-4 w-px bg-white/20 sm:block" />

      <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="rotate()">
        <NuxtIcon name="local:print" class="text-xl" />
      </button>
      <a v-if="doc" :href="`${config.public.docUrl}${doc.previewUrl}?download=true`" target="_blank" class="shrink-0 transition-colors hover:text-primary-500">
        <NuxtIcon name="local:download" class="text-xl" />
      </a>
    </div>

    <slot name="floating-actions" />
  </div>
</template>

<style scoped>
:deep(.vp-container) {
  background: transparent !important;
}
</style>
