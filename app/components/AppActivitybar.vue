<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    editedLabel: string
    collaborators: DriveCollaborator[]
    maxVisible?: number
    extraCount?: number
  }>(),
  {
    maxVisible: 3,
    extraCount: 4,
  }
)

const visible = computed(() => props.collaborators.slice(0, props.maxVisible))
</script>

<template>
  <div class="flex items-center justify-end gap-3 text-white/70">
    <div class="hidden items-center gap-2 text-xs sm:flex">
      <span class="text-white/50">Edited</span>
      <span class="text-white/80">{{ editedLabel }}</span>
    </div>

    <div class="flex items-center">
      <div class="flex -space-x-2">
        <NuxtImg v-for="c in visible" :key="c.id" :src="c.avatarUrl" :alt="c.name" class="h-7 w-7 rounded-full border border-black/60 object-cover" />
      </div>

      <div v-if="extraCount > 0" class="ml-2 rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">+{{ extraCount }}</div>
    </div>

    <button type="button" class="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 sm:flex">
      <NuxtIcon name="mdi:share-variant-outline" class="text-base" />
      Share
    </button>

    <button type="button" class="grid h-8 w-8 place-items-center rounded-full bg-white/0 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Star">
      <NuxtIcon name="mdi:star-outline" class="text-lg" />
    </button>

    <button type="button" class="grid h-8 w-8 place-items-center rounded-full bg-white/0 text-white/70 hover:bg-white/10 hover:text-white" aria-label="More">
      <NuxtIcon name="mdi:dots-horizontal" class="text-lg" />
    </button>
  </div>
</template>
