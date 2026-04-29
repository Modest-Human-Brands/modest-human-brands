<script setup lang="ts">
defineProps<{
  title: string
  description: string
  showBack?: boolean
}>()
defineEmits(['back'])
</script>

<template>
  <header class="mb-8 flex w-full items-end justify-between">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-white md:text-3xl">{{ title }}</h1>
      <p class="text-sm text-light-400">{{ description }}</p>
    </div>

    <button v-if="showBack" class="flex items-center gap-2 text-sm font-bold text-light-400 transition-colors hover:text-white" @click="$emit('back')">
      <NuxtIcon name="local:chevron-bold" class="text-xs" />
      Back
    </button>
  </header>
</template>
