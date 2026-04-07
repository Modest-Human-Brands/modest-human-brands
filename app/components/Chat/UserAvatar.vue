<script setup lang="ts">
const props = defineProps<{
  name: string
  status?: UserStatus
  size?: 'xs' | 'sm' | 'md'
}>()

const STATUS_COLOR: Record<UserStatus, string> = {
  online: '#48FEA7',
  away: '#FFB83D',
  offline: '#8D8D8D',
  dnd: '#FF4444',
}
const initials = computed(() => props.name.charAt(0))
</script>

<template>
  <div class="relative shrink-0">
    <div
      class="flex select-none items-center justify-center rounded-full bg-dark-500 font-bold uppercase text-white"
      :class="{
        'size-7 text-xs': size === 'xs',
        'size-9 text-sm': size === 'sm' || !size,
        'size-11 text-base': size === 'md',
      }">
      {{ initials }}
    </div>
    <div
      v-if="status"
      class="absolute -bottom-px -right-px rounded-full border-2"
      :class="{
        'size-2': size === 'xs' || size === 'sm' || !size,
        'size-2.5': size === 'md',
      }"
      :style="{
        backgroundColor: STATUS_COLOR[status],
      }" />
  </div>
</template>
