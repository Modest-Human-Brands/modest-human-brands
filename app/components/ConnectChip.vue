<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  isActive?: boolean
}>()
</script>

<template>
  <button type="button" :class="['flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors', isActive ? 'bg-dark-500 text-white' : 'bg-transparent text-light-500 hover:bg-dark-500/50']">
    <NuxtIcon :name="icon" class="text-[24xs]" />
    <span class="text-sm">{{ label }}</span>
  </button>
</template>
