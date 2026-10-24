<script setup lang="ts">
defineProps<{
  index?: number
  slug?: string
  status?: string
  segment?: string
}>()
</script>

<template>
  <section class="scrollbar-hidden flex shrink-0 items-center gap-8 overflow-x-auto px-4 py-3 md:gap-14 md:px-8">
    <div
      v-for="field in [
        { label: 'Index', value: index },
        { label: 'Slug', value: slug },
        { label: 'Status', value: status },
        { label: 'Segment', value: segment },
      ]"
      :key="field.label"
      class="flex flex-col gap-1">
      <span class="flex items-center gap-1.5 text-xs text-light-400">
        <NuxtIcon name="ph:dots-six-vertical" class="shrink-0 text-base" />
        {{ field.label }}
      </span>
      <span class="pl-5 text-sm font-semi-bold text-white">{{ field.value ?? '—' }}</span>
    </div>
  </section>
</template>
