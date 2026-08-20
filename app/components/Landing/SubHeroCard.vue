<script setup lang="ts">
defineProps<{
  title: string
  description: string
  image: string
}>()
</script>

<template>
  <div class="relative flex flex-col p-6 after:absolute after:left-0 after:top-0 after:z-10 after:h-px after:w-full after:bg-light-500/25 md:p-8 md:after:left-full md:after:h-full md:after:w-px">
    <h3 class="mb-3 text-xl font-semi-bold">{{ title }}</h3>
    <p class="mb-8 text-base font-regular leading-relaxed text-light-400">{{ description }}</p>

    <div class="mt-auto">
      <img :src="image" :alt="title" class="w-full object-cover" loading="lazy" />
    </div>
  </div>
</template>
