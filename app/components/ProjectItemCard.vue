<script setup lang="ts">
defineProps<{
  projectId: string
  kind: 'script' | 'storyboard' | 'look'
  item: ProjectItem
}>()
</script>

<template>
  <NuxtLink :to="`/project/${projectId}/pre-production/${kind}?item=${item.id}`" class="block w-52 shrink-0 overflow-hidden rounded-xl bg-dark-500 hover:bg-dark-600 md:w-60">
    <div class="relative aspect-[3/2] w-full overflow-hidden bg-dark-600">
      <NuxtImg v-if="item.imageId" :src="item.imageId" :alt="item.title" width="480" class="size-full object-cover object-top" />
      <img v-else :src="placeholderImage(item.index)" :alt="item.title" class="size-full object-cover" />
      <span class="absolute left-2 top-2 rounded bg-dark-400/90 px-2 py-0.5 text-xs font-semi-bold text-white">#{{ item.index }}</span>
      <span v-if="item.duration" class="absolute right-2 top-2 rounded bg-dark-400/90 px-2 py-0.5 text-xs font-semi-bold text-white">{{ item.duration }}</span>
    </div>
    <div class="flex items-start justify-between gap-2 p-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-semi-bold text-white">{{ item.title }}</p>
        <p class="text-[11px] capitalize text-light-500">{{ kind }}</p>
      </div>
      <span v-if="item.status" class="shrink-0 rounded-full bg-dark-600 px-2 py-0.5 text-[11px] text-light-400">{{ item.status }}</span>
    </div>
  </NuxtLink>
</template>
