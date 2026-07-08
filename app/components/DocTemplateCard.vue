<script setup lang="ts">
defineProps<{
  template: {
    id: string
    label?: string
    description?: string
  }
}>()
</script>

<template>
  <NuxtLink
    :to="`/doc/new/${template.id}`"
    class="group relative flex flex-col items-start gap-4 rounded-xl border border-dark-500/60 bg-dark-500/20 p-5 text-left transition-all duration-200 ease-out hover:border-dark-400 hover:bg-dark-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 active:bg-dark-500/60">
    <div class="flex w-full items-start justify-between gap-2">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dark-600 text-light-400 transition-colors duration-200 group-hover:bg-primary-500/10 group-hover:text-primary-400">
        <NuxtIcon name="local:document" class="text-xl" />
      </div>

      <svg
        class="mt-2 size-3.5 shrink-0 -translate-x-1 text-light-400 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:text-primary-400 group-hover:opacity-100"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 8h9M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semi-bold capitalize text-white">
        {{ template.label }}
      </h2>
      <p class="line-clamp-2 text-sm leading-relaxed text-light-500">
        {{ template.description }}
      </p>
    </div>
  </NuxtLink>
</template>
