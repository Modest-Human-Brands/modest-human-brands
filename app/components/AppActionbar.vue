<script setup lang="ts">
type ActionItem = {
  icon: string
  label: string
}

const actions: ActionItem[] = [
  { icon: 'local:filter', label: 'Filters' },
  { icon: 'local:sort', label: 'Sort' },
  { icon: 'local:search', label: 'Search' },
  { icon: 'local:bar', label: 'Properties' },
]
</script>

<template>
  <div class="flex items-center justify-end gap-0.5">
    <button
      v-for="action in actions"
      :key="action.label"
      type="button"
      class="grid place-items-center rounded-full bg-white/0 p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
      :aria-label="action.label"
      :title="action.label">
      <NuxtIcon :name="action.icon" class="text-[20px]" />
    </button>
    <button type="button" class="font-semibold ml-1.5 inline-flex items-center gap-2 rounded-full bg-white fill-black px-3 py-1 text-sm text-black hover:bg-white/90">
      <NuxtIcon name="local:plus" class="text-[20px]" />
      New
    </button>
  </div>
</template>
