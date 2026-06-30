<script setup lang="ts">
import type { PDFDocumentLoadingTask } from 'pdfjs-dist'

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

const VuePDF = defineAsyncComponent(() => import('@tato30/vue-pdf').then((m) => m.VuePDF))

const pdf = shallowRef<PDFDocumentLoadingTask | undefined>(undefined)
const pages = ref(0)

onMounted(async () => {
  const { usePDF } = await import('@tato30/vue-pdf')
  const { pdf: _pdf, pages: _pages } = usePDF(toRef(() => props.src))

  watchEffect(() => {
    pdf.value = _pdf.value
    pages.value = _pages.value
  })
})

const viewerState = reactive({
  page: 1,
  scale: 1,
  rotation: 0,
})
const isSidebarOpen = ref(false)
const fitMode = ref<'auto' | 'width' | 'height'>('auto')

defineExpose({ pdf, pages, zoomIn, zoomOut, resetZoom: fitBy, rotate, setPage, viewerState, isSidebarOpen: isSidebarOpen, fitMode })

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
      //
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
        console.error(error)
      } finally {
        setTimeout(() => {
          iframe.remove()
          if (blobUrl) URL.revokeObjectURL(blobUrl)
        }, 1000)
      }
    }
  } catch (error) {
    console.error(error)
    if (blobUrl) URL.revokeObjectURL(blobUrl)
  }
}
</script>

<template>
  <div class="relative flex size-full flex-1 flex-row overflow-hidden">
    <AppSidebarPreviewList
      v-if="pdf && pages && pages > 1 && showSidebar"
      v-model:drawer-open="isSidebarOpen"
      :items="Array.from({ length: pages }, (_, i) => i + 1)"
      :active-id="viewerState.page"
      @select="setPage">
      <template #item="{ item: p, isActive }">
        <ClientOnly>
          <div class="flex w-full flex-col items-center">
            <div
              :class="isActive ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent'"
              class="aspect-[3/4] w-full shrink-0 rounded border-2 bg-white transition-all hover:border-primary-500/50">
              <VuePDF :pdf="pdf" :page="p" fit-parent />
            </div>
            <span class="mt-2 shrink-0 text-xs font-semi-bold text-light-500">{{ p }}</span>
          </div>
        </ClientOnly>
      </template>
    </AppSidebarPreviewList>

    <div class="relative flex size-full flex-1 flex-col overflow-hidden">
      <slot name="header" />

      <div ref="viewerContainer" class="scrollbar-hidden relative grid size-full overflow-auto p-4 pb-32 md:p-6" @scroll="onScroll">
        <div v-if="isLoading || (!pdf && props.src)" class="m-auto flex flex-col items-center gap-4 text-light-500">
          <NuxtIcon name="local:loader" class="animate-spin text-4xl" />
          <span class="text-sm font-semi-bold uppercase tracking-widest">Loading Document...</span>
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

      <AppFloatingActionToolbar
        v-if="pdf && pages"
        :page="viewerState.page"
        :total-pages="pages"
        :fit-mode="fitMode"
        :download-url="doc ? `${config.public.docUrl}${doc.previewUrl}?download=true` : undefined"
        @update:page="setPage"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @fit-by="fitBy"
        @print="print">
        <template #custom-actions>
          <slot name="toolbar-actions" />
        </template>
      </AppFloatingActionToolbar>
    </div>

    <button
      v-if="pdf && pages && pages > 1 && showSidebar"
      type="button"
      class="absolute left-0 top-1/2 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-white/10 bg-dark-400/80 text-white shadow-md backdrop-blur-md transition-transform active:scale-95 md:hidden"
      @click="isSidebarOpen = !isSidebarOpen">
      <NuxtIcon name="local:chevron-bold" class="text-xs" :class="{ 'scale-x-[-1]': !isSidebarOpen }" />
    </button>

    <slot name="floating-actions" />
  </div>
</template>

<style scoped>
:deep(.vp-container) {
  background: transparent !important;
}
</style>
