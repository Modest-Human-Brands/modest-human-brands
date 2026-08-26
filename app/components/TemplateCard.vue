<script setup lang="ts">
defineProps<{
  id: string
  label?: string
  description?: string
  link: string
}>()
</script>

<template>
  <NuxtLink
    :to="link"
    class="group relative flex flex-col items-start gap-4 rounded-xl border border-dark-500/60 bg-dark-500/20 p-5 text-left transition-all duration-200 ease-out hover:border-dark-400 hover:bg-dark-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500 active:bg-dark-500/60">
    <div class="flex w-full items-start justify-between gap-2">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dark-600 text-light-400 transition-colors duration-200 group-hover:bg-accent-500/10 group-hover:text-accent-400">
        <NuxtIcon name="local:document" class="text-xl" />
      </div>

      <NuxtIcon name="local:chevron-bold" class="scale-[-1] text-[20px]" />
    </div>

    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semi-bold capitalize text-white">
        {{ label }}
      </h2>
      <p class="line-clamp-2 text-sm leading-relaxed text-light-500">
        {{ description }}
      </p>
    </div>
  </NuxtLink>
</template>
