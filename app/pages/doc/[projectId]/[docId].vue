<script setup lang="ts">
import { VuePDF } from '@tato30/vue-pdf'

definePageMeta({
  layout: false,
  middleware: ['auth'],
})

const route = useRoute()
const config = useRuntimeConfig()
const projectId = route.params.projectId as string
const docId = route.params.docId as string

const { data: doc } = await useFetch(`/api/doc/${projectId}/${docId}`)

const pdfUrl = computed(() => (!doc.value ? '' : `${config.public.docUrl}${doc.value.previewUrl}`))

const viewerState = reactive({
  page: 1,
  scale: 1,
  rotation: 0,
})

const actions = {
  zoomIn: () => {
    viewerState.scale += 0.05
  },
  zoomOut: () => {
    if (viewerState.scale > 0.3) viewerState.scale -= 0.05
  },
  rotate: () => {
    viewerState.rotation = (viewerState.rotation + 90) % 360
  },
  setPage: (p: number) => {
    document.getElementById(`pdf-page-${p}`)?.scrollIntoView({ behavior: 'smooth' })
  },
}

const { pdf, pages } = await usePdfViewer(pdfUrl)

const viewerContainer = ref<HTMLElement>()
const { width: containerWidth, height: containerHeight } = useElementSize(viewerContainer)
const baseScale = ref(1)

watch([pdf, containerWidth, containerHeight], async () => {
  if (!pdf.value || !containerHeight.value || !containerWidth.value) return
  const docObj = await pdf.value.promise
  const page = await docObj.getPage(1)
  const viewport = page.getViewport({ scale: 1 })

  const scaleHeight = (containerHeight.value - 64) / viewport.height
  const scaleWidth = (containerWidth.value - 32) / viewport.width

  baseScale.value = Math.min(scaleWidth, scaleHeight)
})

const computedScale = computed(() => baseScale.value * viewerState.scale)

const isLeftOpen = ref(false)
const isRightOpen = ref(false)

function resetClick() {
  isLeftOpen.value = false
  isRightOpen.value = false
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
</script>

<template>
  <main v-if="doc" class="relative flex h-dvh w-full flex-row overflow-hidden bg-dark-500">
    <div v-if="isLeftOpen || isRightOpen" class="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden" @click="resetClick"></div>

    <aside
      :class="[
        isLeftOpen ? 'translate-x-0' : '-translate-x-full',
        'scrollbar-hidden absolute inset-y-0 left-0 z-40 flex w-36 shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-dark-500 p-4 transition-transform duration-300 lg:relative lg:translate-x-0',
      ]">
      <ClientOnly>
        <div v-for="p in pages" :key="p" class="mb-6 flex flex-col items-center">
          <div
            :class="viewerState.page === p ? 'border-primary-500' : 'border-transparent'"
            class="aspect-[3/4] w-full shrink-0 cursor-pointer border-2 bg-white transition-all hover:border-primary-500/50"
            @click="actions.setPage(p)">
            <VuePDF :pdf="pdf" :page="p" fit-parent />
          </div>
          <span class="font-semibold mt-2 shrink-0 text-xs text-light-500">{{ p }}</span>
        </div>
      </ClientOnly>
    </aside>

    <section class="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-dark-400">
      <button class="absolute left-0 top-1/2 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg bg-black/80 text-white lg:hidden" @click="isLeftOpen = true">
        <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-xs" />
      </button>
      <button class="absolute right-0 top-1/2 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-l-lg bg-black/80 text-white lg:hidden" @click="isRightOpen = true">
        <NuxtIcon name="local:chevron-bold" class="text-xs" />
      </button>

      <div ref="viewerContainer" class="scrollbar-hidden flex size-full flex-col items-center gap-8 overflow-y-auto p-4 pb-32 md:p-8" @scroll="onScroll">
        <ClientOnly>
          <div v-for="p in pages" :id="`pdf-page-${p}`" :key="p" class="relative flex flex-col items-center shadow-xl transition-transform">
            <VuePDF :pdf="pdf" :page="p" :scale="computedScale" :rotation="viewerState.rotation" />
          </div>
        </ClientOnly>
      </div>

      <div class="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
        <div class="flex items-center gap-4 rounded-full bg-dark-500 px-4 py-3 text-white ring-1 ring-white/10 md:gap-6 md:px-6">
          <button class="shrink-0 transition-colors hover:text-primary-500" @click="actions.setPage(Math.max(1, viewerState.page - 1))">
            <NuxtIcon name="local:chevron-bold" class="text-lg" />
          </button>
          <span class="font-semibold shrink-0 whitespace-nowrap text-sm"
            >{{ viewerState.page }} <span class="text-white/40">/ {{ pages }}</span></span
          >
          <button class="shrink-0 transition-colors hover:text-primary-500" @click="actions.setPage(Math.min(pages || 1, viewerState.page + 1))">
            <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-lg" />
          </button>

          <div class="h-5 w-px shrink-0 bg-white/20"></div>

          <button class="shrink-0 transition-colors hover:text-primary-500" @click="actions.zoomIn">
            <NuxtIcon name="local:plus" class="text-xl" />
          </button>
          <button class="shrink-0 transition-colors hover:text-primary-500" @click="actions.zoomOut">
            <NuxtIcon name="local:minus" class="text-xl" />
          </button>

          <div class="h-5 w-px shrink-0 bg-white/20" />

          <button class="shrink-0 transition-colors hover:text-primary-500" @click="actions.rotate">
            <NuxtIcon name="local:print" class="text-xl" />
          </button>
          <a :href="`${config.public.docUrl}${doc.previewUrl}?download=true`" target="_blank" class="shrink-0 transition-colors hover:text-primary-500">
            <NuxtIcon name="local:download" class="text-xl" />
          </a>
        </div>
      </div>
    </section>

    <aside
      class="absolute inset-y-0 right-0 z-40 flex w-80 shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-dark-400 p-6 text-white transition-transform duration-300 md:p-8 lg:relative lg:translate-x-0"
      :class="[isRightOpen ? 'translate-x-0' : 'translate-x-full']">
      <div class="mb-10 flex w-full justify-center">
        <NuxtIcon :name="`local:file-${doc.extension}`" class="text-[200px]" />
      </div>

      <div class="flex flex-col gap-5">
        <div>
          <h4 class="mb-1 text-xs text-light-500">File Name</h4>
          <p class="text-sm text-white">{{ doc.name }}</p>
        </div>
        <div>
          <h4 class="mb-1 text-xs text-light-500">Size</h4>
          <p class="text-sm text-white">{{ doc.formattedSize }}</p>
        </div>
      </div>

      <div class="my-8 h-px w-full shrink-0 bg-white/10"></div>

      <div class="relative ml-2 flex flex-col gap-8 border-l border-white/10 pb-8 pl-6">
        <div v-for="item in doc.timeline" :key="item.id" class="relative">
          <div class="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-primary-500 ring-[6px] ring-dark-500"></div>

          <div class="mb-2 flex items-center justify-between text-xs text-light-500">
            <span>{{ item.date }}</span>
            <span>{{ item.time }}</span>
          </div>

          <div class="flex items-start gap-3 text-sm text-white">
            <div class="font-semibold mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] text-black">
              {{ item.userInitials }}
            </div>
            <p class="leading-tight">
              <span class="font-semibold">{{ item.userName }}</span> {{ item.action }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </main>
</template>

<style scoped>
:deep(.vp-container) {
  background: transparent !important;
}
</style>
