<script setup lang="ts">
const props = defineProps<{
  stages?: string[]
  id: string
  index: number
  title: string
  status: string
  createdAt?: string
  period: { start: string; end: string }
  progress: number
  previews: string[]
  assignees: string[]
}>()

const emit = defineEmits<{
  move: [stage: string]
}>()

const created = computed(() => new Date(props.createdAt ?? props.period.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
</script>

<template>
  <!-- Figma: Project Card (265x265, radius 8) -->
  <NuxtLink :to="`/project/${id}/plan`" draggable="true" class="relative flex flex-col overflow-hidden rounded-lg bg-dark-500 md:aspect-square">
    <div class="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-dark-600">
      <span class="absolute left-1 top-1 z-10 rounded bg-dark-500 px-2 pb-[3px] pt-0.5 text-xs">#{{ index }}</span>
      <div class="grid size-full grid-cols-2 grid-rows-2">
        <img v-for="(img, idx) in previews.slice(0, 4)" :key="idx" :src="img" alt="" class="size-full object-cover" loading="lazy" />
      </div>
    </div>
    <div class="flex grow flex-col gap-2 p-2">
      <div class="flex items-start justify-between gap-2">
        <h3 class="truncate text-base">{{ title }}</h3>
        <!-- Changing the stage works on touch too, where cards cannot be dragged between columns -->
        <!-- The chip sizes to its text; the select sits invisibly on top, so the whole chip opens the stage list -->
        <span class="relative shrink-0 rounded bg-info-600 px-2 pb-[3px] pt-0.5 text-xs">
          {{ status }}
          <select
            :value="status"
            aria-label="Move to stage"
            class="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
            @click.prevent.stop
            @change="emit('move', ($event.target as HTMLSelectElement).value)">
            <option v-for="stage in stages ?? [status]" :key="stage" :value="stage" class="bg-dark-500">{{ stage }}</option>
          </select>
        </span>
      </div>
      <span class="truncate text-xs opacity-60">Created: {{ created }}</span>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-dark-600">
          <div :style="{ width: `${progress}%` }" class="h-full rounded-full bg-success-500" />
        </div>
      </div>
      <div class="mt-auto flex items-center justify-between">
        <div class="flex -space-x-3">
          <img v-for="(avatar, i) in assignees" :key="i" :src="avatar" alt="" class="size-6 rounded-full border border-dark-500 object-cover" />
        </div>
      </div>
    </div>
    <button type="button" class="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-md bg-accent-500 px-2 py-1 text-xs transition hover:bg-accent-600">
      <NuxtIcon name="local:link" class="text-[16px]" />
      <span>Share</span>
    </button>
  </NuxtLink>
</template>
