<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <!-- Figma: Kanban Header (265x48, full radius) -->
  <div class="flex h-12 items-center justify-between rounded-full bg-dark-500 pl-2 pr-2.5 text-white">
    <div class="flex items-center gap-1">
      <NuxtIcon name="local:grip" class="text-[24px]" />
      <div class="flex items-center gap-1.5 rounded-full bg-info-400/40 px-3 py-1 text-sm">
        <span class="size-3 rounded-full bg-info-500" />
        <span>{{ title }}</span>
      </div>
    </div>
    <div class="flex items-center gap-[7px]">
      <button type="button" class="rounded-full" aria-label="Column options">
        <NuxtIcon name="local:dots" class="text-[16px]" />
      </button>
      <button type="button" class="rounded-full bg-dark-400 p-1" aria-label="Add project">
        <NuxtIcon name="local:plus" class="text-[16px]" />
      </button>
    </div>
  </div>
</template>
