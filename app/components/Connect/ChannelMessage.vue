<script setup lang="ts">
defineProps<{
  text: string
  time: string
  isOwn?: boolean
  senderName: string
}>()
</script>

<template>
  <div :class="isOwn ? 'flex-row-reverse' : 'flex-row'" class="mb-6 flex items-end gap-3">
    <div v-if="!isOwn" class="flex size-8 items-center justify-center rounded-full bg-dark-600 text-xs font-bold text-white">
      {{ senderName.charAt(0) }}
    </div>

    <div class="flex max-w-[80%] flex-col gap-1">
      <div class="flex items-center gap-2 px-1">
        <span class="text-[10px] font-bold text-white">{{ senderName }}</span>
        <span class="text-[10px] text-white">{{ time }}</span>
      </div>
      <div :class="isOwn ? 'border-white/5 bg-dark-600' : 'border-white/10 bg-dark-500'" class="rounded-2xl border px-4 py-3 text-sm text-white">
        {{ text }}
      </div>
    </div>
  </div>
</template>
