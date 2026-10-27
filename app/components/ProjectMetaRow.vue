<script setup lang="ts">
defineProps<{
  index?: number
  slug?: string
  status?: string
  segment?: string
}>()
</script>

<template>
  <!-- Figma: meta row, 16px label with grip, value indented under the label -->
  <section class="scrollbar-hidden flex shrink-0 items-start gap-6 overflow-x-auto px-4 py-3 text-base font-regular md:px-8">
    <div
      v-for="field in [
        { label: 'Index', value: index, width: 'min-w-[70px]' },
        { label: 'Slug', value: slug, width: 'min-w-[236px]' },
        { label: 'Status', value: status, width: 'min-w-[76px]' },
        { label: 'Segment', value: segment, width: 'min-w-[100px]' },
      ]"
      :key="field.label"
      class="flex shrink-0 flex-col gap-1"
      :class="field.width">
      <span class="flex items-center gap-1 fill-light-500 text-white">
        <NuxtIcon name="local:grip" class="shrink-0 text-[24px]" />
        {{ field.label }}
      </span>
      <span class="whitespace-nowrap pl-7 text-white">{{ field.value ?? '—' }}</span>
    </div>
  </section>
</template>
