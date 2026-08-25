<script setup lang="ts">
defineProps<{
  id: string
  index: number
  title: string
  status: string
  period: { start: string; end: string }
  progress: number
  previews: string[]
  assignees: string[]
}>()
</script>

<template>
  <NuxtLink :to="`/project/${id}`" class="flex aspect-square flex-col overflow-hidden rounded-md bg-dark-500 md:rounded-xl">
    <div class="relative aspect-[16/10] w-full overflow-hidden bg-dark-600">
      <span class="absolute left-1 top-1 z-10 rounded bg-dark-500 px-2 py-0.5 text-xs"> #{{ index }} </span>
      <div class="grid size-full grid-cols-2 grid-rows-2 gap-0.5">
        <img v-for="(img, idx) in previews" :key="idx" :src="img" alt="" class="size-full object-cover" loading="lazy" />
      </div>
    </div>
    <div class="flex flex-col gap-1 p-1.5 md:gap-2 md:p-2">
      <div class="flex items-start justify-between gap-2">
        <h3 class="truncate text-sm md:text-base">{{ title }}</h3>
        <span class="shrink-0 rounded bg-info-600 px-1.5 pb-1 pt-0.5 text-2xs md:text-xs">
          {{ status }}
        </span>
      </div>
      <span class="text-2xs opacity-60 md:text-xs"
        >Priod:
        {{
          new Date(period.start).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
          })
        }}
        -
        {{
          new Date(period.end).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
          })
        }}
      </span>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-xs md:text-sm">
          <span>Progress</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-dark-600">
          <div :style="{ width: `${progress}%` }" class="h-full rounded-full bg-success-500" />
        </div>
      </div>
      <div class="flex items-center justify-between pt-1">
        <div class="flex -space-x-3 overflow-hidden">
          <img v-for="(avatar, i) in assignees" :key="i" :src="avatar" alt="" class="size-6 rounded-full border border-dark-500 object-cover" />
        </div>
        <button type="button" class="relative -bottom-2 -right-2 flex items-center gap-1 rounded-tl-md bg-accent-500 px-2 py-1 text-2xs transition hover:bg-accent-600 md:text-xs">
          <NuxtIcon name="local:link" class="text-[16px]" />
          <span>Share</span>
        </button>
      </div>
    </div>
  </NuxtLink>
</template>
