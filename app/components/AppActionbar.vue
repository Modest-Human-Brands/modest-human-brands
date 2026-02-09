<script setup lang="ts">
type ActionItem = {
  icon: string
  label: string
}

const actions: ActionItem[] = [
  { icon: 'mdi:tune-vertical', label: 'Filters' },
  { icon: 'mdi:sort', label: 'Sort' },
  { icon: 'mdi:flash-outline', label: 'Quick' },
  { icon: 'mdi:magnify', label: 'Search' },
]
</script>

<template>
  <div class="flex items-center justify-end gap-2">
    <button
      v-for="action in actions"
      :key="action.label"
      type="button"
      class="grid h-9 w-9 place-items-center rounded-xl bg-white/0 text-white/70 hover:bg-white/10 hover:text-white"
      :aria-label="action.label"
      :title="action.label">
      <NuxtIcon :name="action.icon" class="text-lg" />
    </button>

    <div class="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

    <button type="button" class="font-semibold inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-black hover:bg-white/90">
      <NuxtIcon name="mdi:plus" class="text-base" />
      New
      <NuxtIcon name="mdi:chevron-down" class="text-base opacity-80" />
    </button>
  </div>
</template>
