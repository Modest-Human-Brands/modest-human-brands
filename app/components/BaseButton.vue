<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'white'
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button
    :disabled="loading || disabled"
    :class="[
      'flex items-center justify-center gap-3 rounded-xl px-8 py-3 text-sm font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'primary' ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-white text-black hover:bg-primary-400 hover:text-white',
    ]">
    <NuxtIcon v-if="loading" name="local:loader" class="animate-spin text-xl" />
    <slot v-else />
  </button>
</template>
