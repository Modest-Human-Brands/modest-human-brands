<script setup lang="ts">
import { VuePDF } from '@tato30/vue-pdf'

const props = withDefaults(
  defineProps<{
    src: string
    isLoading?: boolean
    showSidebar?: boolean
    doc?: {
      id: string
      name: string
      previewUrl: string
    }
  }>(),
  {
    isLoading: false,
    showSidebar: true,
  }
)

const { pdf, pages } = usePdfViewer(() => props.src)

const viewerState = reactive({
  page: 1,
  scale: 1,
  rotation: 0,
})
const isSidebarOpen = ref(false)
const fitMode = ref<'auto' | 'width' | 'height'>('auto')

defineExpose({ pdf, pages, zoomIn, zoomOut, resetZoom: fitBy, rotate, setPage, viewerState, isSidebarOpen, fitMode })

const config = useRuntimeConfig()

const viewerContainer = ref<HTMLElement>()
const { width: containerWidth, height: containerHeight } = useElementSize(viewerContainer)
const pdfViewportHeight = ref(768)
const rawPageDimensions = shallowRef<{ width: number; height: number } | null>(null)

watch(
  [pdf, () => viewerState.rotation],
  async () => {
    if (!pdf.value) return
    try {
      const docObj = await pdf.value.promise
      const pageObj = await docObj.getPage(1)
      const viewport = pageObj.getViewport({ scale: 1, rotation: viewerState.rotation })
      pdfViewportHeight.value = viewport.height
      rawPageDimensions.value = { width: viewport.width, height: viewport.height }
    } catch {
      // Silently handle viewport computation fallback
    }
  },
  { immediate: true }
)

const scaleWidth = computed(() => {
  if (!rawPageDimensions.value || !containerWidth.value) return 1
  const availableW = Math.max(100, containerWidth.value)
  return availableW / rawPageDimensions.value.width
})

const scaleHeight = computed(() => {
  if (!rawPageDimensions.value || !containerHeight.value) return 1
  const availableH = Math.max(100, containerHeight.value)
  return availableH / rawPageDimensions.value.height
})

const baseScale = computed(() => {
  if (fitMode.value === 'width') return scaleWidth.value
  if (fitMode.value === 'height') return scaleHeight.value
  return Math.min(scaleWidth.value, scaleHeight.value)
})

const computedScale = computed(() => baseScale.value * viewerState.scale)

function setPage(p: number) {
  viewerState.page = p
  document.getElementById(`pdf-page-${p}`)?.scrollIntoView({ behavior: 'smooth' })
  isSidebarOpen.value = false
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

function fitBy() {
  viewerState.scale = 1

  if (fitMode.value === 'auto') {
    const isWidthShorter = scaleWidth.value < scaleHeight.value
    fitMode.value = isWidthShorter ? 'height' : 'width'
  } else if (fitMode.value === 'width') {
    fitMode.value = 'height'
  } else {
    fitMode.value = 'width'
  }
}

function rotate() {
  viewerState.rotation = (viewerState.rotation + 90) % 360
}

async function print() {
  if (!props.src) return

  let blobUrl: string | null = null

  try {
    const response = await fetch(props.src)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)

    const blob = await response.blob()
    blobUrl = URL.createObjectURL(blob)

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    iframe.src = blobUrl

    document.body.appendChild(iframe)

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch (error) {
        console.error('[PDFViewer] Print execution failed:', error)
      } finally {
        setTimeout(() => {
          iframe.remove()
          if (blobUrl) URL.revokeObjectURL(blobUrl)
        }, 1000)
      }
    }
  } catch (error) {
    console.error('[PDFViewer] Failed to load PDF for printing:', error)
    if (blobUrl) URL.revokeObjectURL(blobUrl)
  }
}
</script>

<template>
  <div class="relative flex size-full flex-1 flex-row overflow-hidden">
    <div v-if="isSidebarOpen" class="backdrop-blur-xs absolute inset-0 z-30 bg-black/60 transition-opacity lg:hidden" @click="isSidebarOpen = false" />

    <aside
      v-if="pdf && pages && pages > 1 && showSidebar"
      :class="[
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'scrollbar-hidden absolute inset-y-0 left-0 z-40 flex w-36 shrink-0 select-none flex-col overflow-y-auto border-r border-white/5 p-4 transition-transform duration-300 lg:relative lg:translate-x-0',
      ]">
      <ClientOnly>
        <div v-for="p in pages" :key="p" class="mb-6 flex flex-col items-center">
          <div
            :class="viewerState.page === p ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent'"
            class="aspect-[3/4] w-full shrink-0 cursor-pointer rounded border-2 bg-white transition-all hover:border-primary-500/50"
            @click="setPage(p)">
            <VuePDF :pdf="pdf" :page="p" fit-parent />
          </div>
          <span class="font-semibold mt-2 shrink-0 text-xs text-light-500">{{ p }}</span>
        </div>
      </ClientOnly>
    </aside>

    <div class="relative flex size-full flex-1 flex-col overflow-hidden">
      <slot name="header" />

      <div ref="viewerContainer" class="scrollbar-hidden relative grid size-full overflow-auto p-4 pb-32 md:p-6" @scroll="onScroll">
        <div v-if="isLoading || (!pdf && props.src)" class="m-auto flex flex-col items-center gap-4 text-light-500">
          <NuxtIcon name="local:loader" class="animate-spin text-4xl" />
          <span class="text-sm font-bold uppercase tracking-widest">Loading Document...</span>
        </div>

        <div v-else-if="pdf && pages" class="m-auto flex w-full max-w-fit flex-col items-center gap-8 pb-16 transition-all duration-300">
          <ClientOnly>
            <div v-for="p in pages" :id="`pdf-page-${p}`" :key="p" class="relative inline-block bg-white shadow-xl" style="line-height: 0">
              <VuePDF :pdf="pdf" :page="p" :scale="computedScale" :rotation="viewerState.rotation" />

              <slot name="page-overlay" :page="p" :scale="computedScale" :viewport-height="pdfViewportHeight" :total-pages="pages" />
            </div>
          </ClientOnly>
        </div>
      </div>

      <div v-if="pdf && pages" class="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-dark-400 px-6 py-3 text-white md:bottom-6">
        <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="setPage(Math.max(1, viewerState.page - 1))">
          <NuxtIcon name="local:chevron-bold" class="text-lg" />
        </button>
        <span class="whitespace-nowrap text-center text-xs font-bold text-light-400"> {{ viewerState.page }} / {{ pages }} </span>
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
        <button type="button" class="transition-colors hover:text-primary-500" :title="fitMode === 'width' ? 'Toggle Fit Height' : 'Toggle Fit Width'" @click="fitBy">
          <NuxtIcon name="local:zoom-fit" class="text-lg" />
        </button>

        <div class="h-4 w-px bg-white/20" />

        <slot name="toolbar-actions" />

        <a v-if="doc" :href="`${config.public.docUrl}${doc.previewUrl}?download=true`" target="_blank" class="shrink-0 transition-colors hover:text-primary-500">
          <NuxtIcon name="local:download" class="text-xl" />
        </a>
        <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="print()">
          <NuxtIcon name="local:print" class="text-xl" />
        </button>
      </div>
    </div>

    <button
      v-if="pdf && pages && pages > 1 && showSidebar"
      type="button"
      class="backdrop-blur-xs absolute left-0 top-1/2 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-white/10 bg-dark-400 text-white shadow-md transition-transform active:scale-95 lg:hidden"
      @click="isSidebarOpen = true">
      <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-xs" />
    </button>

    <slot name="floating-actions" />
  </div>
</template>

<style scoped>
:deep(.vp-container) {
  background: transparent !important;
}
</style>
