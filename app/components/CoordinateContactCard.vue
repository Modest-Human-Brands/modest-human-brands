<script setup lang="ts">
import type { CoordinateConversation } from '~/composables/useCoordinate'

const props = defineProps<{
  conversation: CoordinateConversation
  isActive?: boolean
}>()

const timeAgo = useTimeAgo(new Date(props.conversation.lastActive))
const initials = computed(() => props.conversation.name.charAt(0).toUpperCase())
</script>

<template>
  <NuxtLink
    :to="`/coordinate/${conversation.id}`"
    class="flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-colors"
    :class="[isActive ? 'bg-dark-600 shadow-md' : 'bg-dark-500 hover:bg-dark-600']">
    <!-- Avatar -->
    <div class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-lg font-bold text-dark-500">
      <img v-if="conversation.avatarUrl" :src="conversation.avatarUrl" class="h-full w-full object-cover" />
      <span v-else>{{ initials }}</span>
    </div>

    <!-- Content Area -->
    <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <div class="flex items-center justify-between">
        <span class="truncate text-sm font-bold text-white">{{ conversation.name }}</span>
        <span class="shrink-0 text-xs font-light text-light-400">{{ timeAgo }}</span>
      </div>
      <div class="flex items-end justify-between gap-4">
        <span class="truncate text-sm text-light-500">{{ conversation.snippet }}</span>
        <span class="shrink-0 text-2xs font-bold uppercase tracking-wider text-light-600">
          {{ conversation.projectContext }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
