<script setup lang="ts">
defineProps<{
  color?: 'success' | 'primary'
}>()
</script>

<template>
  <div class="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition hover:border-white/30">
    <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
      <div class="absolute -left-12 -top-12 h-24 w-24 rounded-full bg-white/20 blur-3xl" />
    </div>

    <div class="relative">
      <slot />
    </div>
  </div>
</template>
