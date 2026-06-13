<script setup lang="ts">
const emit = defineEmits<{ 'start-call': [] }>()
</script>

<template>
  <div class="flex w-full flex-col items-center justify-center gap-4 p-6">
    <button class="flex items-center gap-3 rounded-full bg-success-600 px-8 py-3 text-sm font-bold text-dark-400 shadow-lg transition-all hover:bg-success-500" @click="emit('start-call')">
      <NuxtIcon name="local:phone" class="text-lg" />
      Initiate Voice Call
    </button>
  </div>
</template>
