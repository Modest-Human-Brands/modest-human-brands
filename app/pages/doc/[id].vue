<script setup lang="ts">
import type { DocumentMeta } from './template.vue'

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const config = useRuntimeConfig()
const docId = route.params.id as string

const { data: doc, status } = await useFetch<DocumentMeta>(`/api/document/${docId}`, {
  baseURL: config.public.docUrl,
})

const pdfUrl = computed(() => {
  if (!doc.value) return ''
  return `${config.public.docUrl}/api/document/${docId}/content#view=Fit`
})
</script>

<template>
  <main v-if="doc" class="flex h-full w-full flex-col overflow-hidden bg-black">
    <header class="flex items-center justify-between border-b border-dark-600 bg-dark-500/50 p-2 backdrop-blur-md md:p-4">
      <div class="flex items-center gap-4">
        <NuxtLink to="/doc" class="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-600 text-light-600 transition-colors hover:bg-dark-400 hover:text-white">
          <NuxtIcon name="local:chevron-bold" />
        </NuxtLink>
        <div>
          <h1 v-if="doc" class="font-semibold text-lg text-white">{{ doc.label }}</h1>
          <div v-else class="h-6 w-32 animate-pulse rounded bg-dark-600"></div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          external
          class="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
          :to="`${config.public.docUrl}/api/document/${docId}/content?download=true#view=Fit`">
          <NuxtIcon name="local:download" class="fill-black" />
          Download PDF
        </NuxtLink>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <section class="relative flex-1 bg-dark-400 p-2 md:p-4">
        <div class="h-full w-full overflow-hidden bg-dark-500 shadow-2xl ring-1 ring-dark-600">
          <div v-if="status === 'pending'" class="flex h-full w-full items-center justify-center text-light-600">
            <NuxtIcon name="local:loader" class="animate-spin text-3xl" />
          </div>

          <iframe v-else-if="pdfUrl" :src="pdfUrl" class="h-full w-full border-none" title="PDF Preview" />

          <div v-else class="flex h-full w-full flex-col items-center justify-center gap-4 text-light-600">
            <NuxtIcon name="local:alert" class="text-4xl text-alert-500" />
            <p>Unable to load document preview.</p>
          </div>
        </div>
      </section>

      <aside class="hidden w-80 flex-col border-l border-dark-600 bg-dark-500/30 p-6 lg:flex">
        <h2 class="mb-6 text-xs font-bold uppercase tracking-widest text-light-600">Document Information</h2>

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-light-600">Template Used</span>
            <span class="font-medium text-sm capitalize text-white">{{ doc?.template.replace(/-/g, ' ') }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs text-light-600">Created At</span>
            <NuxtTime :datetime="doc.createdAt" class="font-medium text-sm text-white" day="numeric" month="short" year="numeric" :hour12="true" hour="2-digit" minute="2-digit" />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs text-light-600">File Reference</span>
            <span class="font-mono break-all text-[10px] text-primary-400 opacity-70">{{ doc.fileName }}</span>
          </div>

          <hr class="border-dark-600" />

          <div class="flex flex-col gap-3">
            <button class="flex w-full items-center justify-between rounded-lg bg-dark-600 px-4 py-3 text-sm text-white transition-colors hover:bg-dark-400">
              <span>View Raw Data</span>
              <NuxtIcon name="local:code" />
            </button>
            <button class="flex w-full items-center justify-between rounded-lg bg-alert-500/10 px-4 py-3 text-sm text-alert-500 transition-colors hover:bg-alert-500 hover:text-white">
              <span>Delete Document</span>
              <NuxtIcon name="local:trash" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
/* Ensure the layout fills the viewport minus any global nav height */
main {
  height: calc(100vh - 0px);
  /* Adjust based on your header layout */
}
</style>
