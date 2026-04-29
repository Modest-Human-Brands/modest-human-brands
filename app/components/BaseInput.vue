<script setup lang="ts">
const modelValue = defineModel<string>()
defineProps<{
  label?: string
  type?: string
}>()
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <label v-if="label" class="text-sm font-semi-bold uppercase tracking-wider text-light-400">
      {{ label }}
    </label>

    <textarea v-if="type === 'textarea'" v-bind="$attrs" v-model="modelValue" class="base-field resize-none" rows="4" />

    <input v-else v-bind="$attrs" v-model="modelValue" :type="type" class="base-field" />
  </div>
</template>

<style scoped>
.base-field {
  @apply w-full rounded-xl border border-dark-600 bg-dark-500 px-4 py-3 text-white transition-all placeholder:text-dark-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50;
}
</style>
