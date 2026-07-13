<script setup lang="ts">
withDefaults(
  defineProps<{
    page?: number
    totalPages?: number
    fitMode?: 'auto' | 'width' | 'height'
    showPagination?: boolean
    showZoom?: boolean
    showComments?: boolean
    showDownload?: boolean
    showPrint?: boolean
    commentsActive?: boolean
  }>(),
  {
    page: 1,
    totalPages: 1,
    fitMode: 'auto',
    showPagination: false,
    showZoom: false,
    showComments: false,
    showDownload: false,
    showPrint: false,
    commentsActive: false,
  }
)

const emit = defineEmits<{
  'update:page': [value: number]
  zoomIn: []
  zoomOut: []
  fitBy: []
  comment: []
  download: []
  print: []
}>()
</script>

<template>
  <div
    class="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 select-none items-center gap-2.5 rounded-full border border-white/10 bg-light-600 px-6 py-3 shadow-2xl backdrop-blur-md dark:bg-dark-400 md:bottom-6 md:gap-4">
    <template v-if="showPagination">
      <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="emit('update:page', Math.max(1, page - 1))">
        <NuxtIcon name="local:chevron-bold" class="text-lg" />
      </button>

      <span class="min-w-[40px] whitespace-nowrap text-center text-xs font-semi-bold"> {{ page }} / {{ totalPages }} </span>

      <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="emit('update:page', Math.min(totalPages, page + 1))">
        <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-lg" />
      </button>

      <div class="h-4 w-px bg-white/20" />
    </template>

    <template v-if="showZoom">
      <button type="button" class="transition-colors hover:text-primary-500" @click="emit('zoomIn')">
        <NuxtIcon name="local:plus" class="text-lg" />
      </button>

      <button type="button" class="transition-colors hover:text-primary-500" @click="emit('zoomOut')">
        <NuxtIcon name="local:minus" class="text-lg" />
      </button>

      <button type="button" class="transition-colors hover:text-primary-500" :title="fitMode === 'width' ? 'Toggle Fit Height' : 'Toggle Fit Width'" @click="emit('fitBy')">
        <NuxtIcon name="local:zoom-fit" class="text-lg" />
      </button>

      <div class="h-4 w-px bg-white/20" />
    </template>

    <slot name="custom-actions" />

    <button v-if="showComments" type="button" class="shrink-0 transition-colors hover:text-primary-500" :class="commentsActive ? 'text-primary-500' : 'text-white'" @click="emit('comment')">
      <NuxtIcon name="local:comment" class="text-xl" />
    </button>

    <button v-if="showDownload" type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="emit('download')">
      <NuxtIcon name="local:download" class="text-xl" />
    </button>

    <button v-if="showPrint" type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="emit('print')">
      <NuxtIcon name="local:print" class="text-xl" />
    </button>
  </div>
</template>
