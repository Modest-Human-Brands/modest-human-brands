<script setup lang="ts">
const props = defineProps<{
  status: StreamStatus
}>()

const isLive = computed(() => props.status === 'live')
</script>

<template>
  <div class="flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm transition" :class="[isLive ? 'bg-alert-500' : 'bg-dark-500']">
    <span class="relative flex size-2">
      <span class="absolute inline-flex size-full animate-ping rounded-full opacity-75" :class="[isLive ? 'bg-white' : 'bg-alert-400']" />
      <span class="relative inline-flex size-2 rounded-full" :class="[isLive ? 'bg-white' : 'bg-alert-500']" />
    </span>
    <span class="font-semibold text-xs uppercase tracking-wider text-white">Live</span>
  </div>
</template>
