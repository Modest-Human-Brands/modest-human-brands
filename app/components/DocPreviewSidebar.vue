<script setup lang="ts">
export interface DocumentDetail {
  id: string
  name: string
  sizeBytes: number
  extension: string
  uploadedBy: { name: string; avatar?: string }
  uploadedAt: string
  project: string
  source: string
  previewUrl?: string
}

defineProps<{ document: DocumentDetail | null }>()
</script>

<template>
  <div class="flex size-full flex-col overflow-y-auto bg-dark-400 p-6 md:w-[380px]">
    <div v-if="!document" class="flex h-full flex-col items-center justify-center text-white/40">
      <NuxtIcon name="local:document" class="mb-4 text-4xl opacity-50" />
      <p class="text-sm font-bold">Select a document to preview</p>
    </div>

    <div v-else class="flex flex-col gap-8">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-bold text-white">{{ document.name }}</h2>
          <p class="font-semibold text-sm uppercase tracking-wider text-light-500">{{ formatBytes(document.sizeBytes) }} • {{ document.extension }}</p>
        </div>
        <button class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:bg-white/5">
          <NuxtIcon name="local:download" class="text-lg" />
        </button>
      </div>

      <div class="flex flex-col gap-4 text-sm">
        <div class="flex items-center gap-4">
          <span class="font-semibold flex w-24 shrink-0 items-center gap-2 text-light-500"> <NuxtIcon name="local:chevron-bold" /> Created by: </span>
          <div class="flex items-center gap-2 text-white">
            <div class="flex size-6 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold text-black">
              <img v-if="document.uploadedBy.avatar" :src="document.uploadedBy.avatar" class="size-full object-cover" />
              <span v-else>{{ document.uploadedBy.name.charAt(0) }}</span>
            </div>
            <span class="font-bold">{{ document.uploadedBy.name }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="font-semibold flex w-24 shrink-0 items-center gap-2 text-light-500"> <NuxtIcon name="local:person" /> Source: </span>
          <span class="rounded bg-white/10 px-2 py-0.5 text-xs font-bold text-white">{{ document.source }}</span>
        </div>

        <div class="flex items-center gap-4">
          <span class="font-semibold flex w-24 shrink-0 items-center gap-2 text-light-500"> <NuxtIcon name="local:chevron-bold" /> Uploaded: </span>
          <span class="font-bold text-white">{{ document.uploadedAt }}</span>
        </div>
      </div>

      <div class="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 shadow-inner">
        <!-- <div class="absolute inset-0 p-4 opacity-50 transition-opacity group-hover:opacity-100">
            <div class="mb-6 h-3 w-3/4 rounded bg-dark-500/20"></div>
            <div class="mb-2 h-2 w-full rounded bg-dark-500/10"></div>
            <div class="mb-2 h-2 w-5/6 rounded bg-dark-500/10"></div>
            <div class="mb-6 h-2 w-full rounded bg-dark-500/10"></div>
            <div class="mb-6 h-px w-full bg-dark-500/20"></div>
            <div class="mb-2 flex items-start gap-2">
              <div class="mt-1 h-2 w-2 rounded-full bg-dark-500/30"></div>
              <div class="h-2 w-5/6 rounded bg-dark-500/10"></div>
            </div>
          </div>

          <button class="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-white text-dark-500 shadow-lg ring-1 ring-dark-500/10 transition-transform hover:scale-110">
            <NuxtIcon name="local:expand" class="text-lg" />
          </button> -->
      </div>
    </div>
  </div>
</template>
