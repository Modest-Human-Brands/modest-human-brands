<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  selected?: boolean
}>()
</script>

<template>
  <button
    type="button"
    :class="[
      'group relative flex w-full flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all duration-300',
      selected ? 'border-primary-500 bg-dark-500 ring-1 ring-primary-500' : 'border-dark-600 bg-dark-400 hover:border-primary-500/50 hover:bg-dark-500',
    ]">
    <div :class="['flex h-12 w-12 items-center justify-center rounded-xl transition-colors', selected ? 'bg-primary-500 text-white' : 'bg-dark-600 text-primary-500 group-hover:bg-primary-500/10']">
      <slot name="icon" />
    </div>

    <div class="pr-8">
      <h3 class="text-lg font-bold text-white">{{ title }}</h3>
      <p class="mt-1 text-sm leading-relaxed text-light-400">{{ description }}</p>
    </div>

    <div class="absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all" :class="selected ? 'border-primary-500 bg-primary-500' : 'border-dark-600'">
      <div v-if="selected" class="h-2 w-2 rounded-full bg-white" />
    </div>
  </button>
</template>
