<script setup lang="ts">
defineProps<{
  title: string
  docCount: number
  folderCount: number
  icon: string
}>()
</script>

<template>
  <div class="group flex flex-1 items-center justify-between rounded-xl bg-dark-500 p-5 ring-1 ring-dark-600 transition-all hover:ring-primary-500">
    <div class="flex items-center gap-4">
      <div class="flex items-center justify-center rounded-lg group-hover:bg-primary-600/20 group-hover:text-primary-400">
        <NuxtIcon :name="icon" class="text-2xl" />
      </div>
      <div>
        <h3 class="font-semibold text-white">{{ title }}</h3>
        <p class="text-xs text-light-600">{{ docCount }} documents • {{ folderCount }} folders</p>
      </div>
    </div>
    <button class="text-light-600 hover:text-white">
      <NuxtIcon name="local:ellipsis" />
    </button>
  </div>
</template>
