<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    editedAt: string
    collaborators: User[]
    maxVisible?: number
  }>(),
  {
    maxVisible: 3,
  }
)

const visibleCollaborators = computed(() => props.collaborators.slice(0, props.maxVisible))
const extraCollaborators = computed(() => props.collaborators.length - visibleCollaborators.value.length)
</script>

<template>
  <div class="flex items-center justify-end gap-0 text-white/70">
    <div class="hidden items-center gap-2 px-4 text-sm sm:flex">
      <span class="">Edited</span>
      <NuxtTime :datetime="editedAt" day="numeric" month="short" />
    </div>
    <div class="-space-x-3">
      <img v-for="{ id, avatar, name } in visibleCollaborators" :key="id" :src="avatar" :alt="name" class="inline-block size-7 rounded-full border border-black bg-black object-cover" />
    </div>
    <span v-if="extraCollaborators > 0" class="px-2 py-2 text-xs text-white"> +{{ extraCollaborators }} </span>
    <button type="button" class="hidden px-2 py-2 sm:block">Share</button>
    <button type="button" class="rounded-full bg-white/0 p-2 text-white hover:bg-white/10" aria-label="Star">
      <NuxtIcon name="local:star" class="text-[24px]" />
    </button>
    <button type="button" class="rounded-full bg-white/0 p-2 text-white hover:bg-white/10" aria-label="More">
      <NuxtIcon name="local:dots" class="text-[24px]" />
    </button>
  </div>
</template>
