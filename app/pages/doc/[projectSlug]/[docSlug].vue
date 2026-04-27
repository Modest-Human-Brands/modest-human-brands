<script setup lang="ts">
import { VuePDF } from '@tato30/vue-pdf'
import type { DocumentMeta } from '../new.vue'

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const config = useRuntimeConfig()
const docSlug = route.params.docSlug as string

const { data: doc } = await useFetch<DocumentMeta>(`/api/document/${docSlug}`, {
  baseURL: config.public.docUrl,
})

const pdfUrl = computed(() => {
  if (!doc.value) return ''
  return `${config.public.docUrl}/api/document/${docSlug}/content`
})

const documentDetails = reactive({
  createdBy: 'Aratrik Nandy',
  tags: ['Internship'],
  description: 'Internship Complition Certficate',
})

const tabs = reactive(['Details', 'Activity', 'Comments'])

const viewerState = reactive({
  page: 1,
  scale: 1,
  rotation: 0,
  activeTab: 'Details',
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
    viewerState.page = p
  },
}

const { pdf, pages } = await usePdfViewer(pdfUrl)

const viewerContainer = ref<HTMLElement>()
const { height: containerHeight } = useElementSize(viewerContainer)

const baseScale = ref(1)

watch([pdf, containerHeight], async () => {
  if (!pdf.value || !containerHeight.value) return
  const doc = await pdf.value.promise
  const page = await doc.getPage(viewerState.page)
  const viewport = page.getViewport({ scale: 1 })
  baseScale.value = containerHeight.value / viewport.height
})

const computedScale = computed(() => baseScale.value * viewerState.scale)
</script>

<template>
  <section v-if="doc" class="flex h-full w-full flex-col bg-dark-400 font-main">
    <header class="flex shrink-0 flex-wrap items-center justify-between gap-4 px-2 py-2 md:px-4">
      <div class="flex min-w-0 grow items-center gap-3 md:gap-4">
        <NuxtIcon :name="`local:file-${doc.extension}`" class="shrink-0 text-2xl md:text-3xl" />
        <h1 class="truncate text-base font-bold tracking-tight text-white md:text-2xl">
          {{ doc.name }}
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          external
          class="flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/5"
          :to="`${config.public.docUrl}/api/document/${docSlug}/content?download=true`">
          <NuxtIcon name="local:download" />
          <span class="hidden md:inline">Download</span>
        </NuxtLink>
        <NuxtLink class="flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/5" to="/connect">
          <NuxtIcon name="local:network" />
          <span class="hidden md:inline">Send</span>
        </NuxtLink>
      </div>
    </header>

    <div class="flex grow flex-col overflow-hidden border-t border-white/5 lg:flex-row">
      <section class="relative flex aspect-[5/7] w-full shrink-0 flex-col overflow-hidden lg:aspect-auto lg:h-full lg:flex-1">
        <div class="scrollbar-hidden flex shrink-0 items-center justify-between overflow-x-auto border-b border-white/5 px-4 py-3">
          <div class="flex items-center gap-4">
            <button class="text-white transition-colors hover:text-primary-500">
              <NuxtIcon name="local:grid" class="text-xl" />
            </button>
          </div>

          <div class="mx-4 flex items-center gap-6">
            <div class="flex items-center gap-3 text-sm text-white">
              <input v-model.number="viewerState.page" type="number" min="1" :max="pages" class="w-8 bg-transparent text-center text-white outline-none" />
              <span class="text-dark-600">/</span>
              <span>{{ pages }}</span>
            </div>

            <div class="flex items-center gap-4 border-l border-white/10 pl-6">
              <button class="text-white hover:text-primary-500" @click="actions.zoomOut">
                <NuxtIcon name="local:minus" class="text-lg" />
              </button>
              <span class="font-medium w-12 text-center text-sm text-white"> {{ Math.round(viewerState.scale * 100) }}% </span>
              <button class="text-white hover:text-primary-500" @click="actions.zoomIn">
                <NuxtIcon name="local:plus" class="text-lg" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button class="text-white hover:text-primary-500">
              <NuxtIcon name="local:corners-out" class="text-xl" />
            </button>
            <button class="text-white hover:text-primary-500" @click="actions.rotate">
              <NuxtIcon name="local:arrows-clockwise" class="text-xl" />
            </button>
          </div>
        </div>

        <div class="flex grow gap-4 overflow-hidden p-2 md:p-4">
          <aside class="hidden w-28 shrink-0 overflow-y-auto lg:block">
            <ClientOnly>
              <div
                v-for="p in pages"
                :key="p"
                :class="viewerState.page === p ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent'"
                class="mb-4 aspect-[3/4] w-full cursor-pointer border-2 bg-white p-1 transition-all"
                @click="actions.setPage(p)">
                <VuePDF :pdf="pdf" :page="p" fit-parent />
              </div>
            </ClientOnly>
          </aside>
          <div ref="viewerContainer" class="flex flex-1 overflow-hidden">
            <div class="relative flex-1 overflow-auto">
              <div class="flex h-full items-center justify-center">
                <ClientOnly>
                  <!-- Use computedScale instead of viewerState.scale -->
                  <VuePDF :pdf="pdf" :page="viewerState.page" :scale="computedScale" :rotation="viewerState.rotation" />
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="flex min-h-0 w-full max-w-md grow flex-col border-t border-white/5 lg:border-l lg:border-t-0">
        <nav class="flex shrink-0 border-b border-white/5 px-6">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="viewerState.activeTab === tab ? 'border-b-2 border-white text-white' : 'text-light-500'"
            class="px-4 py-4 text-sm font-bold transition-all hover:text-white"
            @click="viewerState.activeTab = tab">
            {{ tab }}
          </button>
        </nav>

        <div class="grow overflow-y-auto p-6 md:p-8">
          <div class="flex flex-col gap-8">
            <div class="grid grid-cols-2 gap-y-6">
              <span class="font-medium text-sm text-light-500">Type</span>
              <div class="flex items-center gap-2 text-sm uppercase text-white">
                <NuxtIcon :name="`local:file-${doc.extension}`" class="text-lg" />
                {{ doc.extension }}
              </div>

              <span class="font-medium text-sm text-light-500">Size</span>
              <span class="text-sm text-white">{{ (doc.sizeBytes / 1024).toFixed(1) }} KB</span>

              <span class="font-medium text-sm text-light-500">Created</span>
              <span class="text-sm text-white">
                <NuxtTime :datetime="doc.createdAt" year="numeric" month="short" day="2-digit" hour="2-digit" minute="2-digit" />
              </span>

              <span class="font-medium text-sm text-light-500">Created by</span>
              <div class="flex items-center gap-2 text-sm text-white">
                <div class="size-6 rounded-full bg-dark-600"></div>
                {{ documentDetails.createdBy }}
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <span class="font-medium text-sm text-light-500">Tags</span>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in documentDetails.tags" :key="tag" class="rounded-lg border border-white/5 bg-dark-500 px-3 py-1.5 text-sm text-white">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm text-light-500">Description</span>
                <button class="text-light-400 hover:text-white">
                  <NuxtIcon name="local:pencil-simple" />
                </button>
              </div>
              <p class="text-sm leading-relaxed text-light-400">
                {{ documentDetails.description }}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
:deep(.vp-container) {
  background: transparent !important;
}
</style>
