<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="flex items-center justify-between rounded-full bg-dark-500 px-2 py-2.5 text-white">
    <div class="flex items-center gap-2">
      <NuxtIcon name="local:grip" class="text-[24px]" />
      <div class="flex items-center gap-1.5 rounded-full bg-info-600 px-3 py-1 text-2xs font-semi-bold md:text-sm">
        <span class="size-3 rounded-full bg-info-400" />
        <span>{{ title }}</span>
      </div>
    </div>
    <div class="flex items-center gap-1">
      <button type="button" class="rounded-full p-1">
        <NuxtIcon name="local:dots" class="text-[16px]" />
      </button>
      <button type="button" class="rounded-full bg-dark-400 p-1">
        <NuxtIcon name="local:plus" class="text-[16px]" />
      </button>
    </div>
  </div>
</template>
