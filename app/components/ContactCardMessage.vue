<script setup lang="ts">
const props = defineProps<{
  senderName: string
  senderEmail: string
  subject: string
  preview: string
  date: string
  avatarUrl?: string
  avatarText?: string
  isActive?: boolean
}>()

const timeAgo = useTimeAgo(() => new Date(props.date))
</script>

<template>
  <div
    :class="['flex cursor-pointer flex-col gap-2.5 rounded-xl border p-4 transition-colors', isActive ? 'border-dark-500 bg-dark-500/80' : 'border-transparent bg-dark-500/30 hover:bg-dark-500/60']">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <img v-if="avatarUrl" :src="avatarUrl" alt="" class="size-10 rounded-full object-cover" loading="lazy" />
        <div v-else class="text-3xs flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-bold uppercase text-black">
          {{ avatarText || senderName.charAt(0) }}
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semi-bold text-white">{{ senderName }}</span>
          <span class="font-medium text-xs text-light-500">{{ senderEmail }}</span>
        </div>
      </div>
      <span class="font-medium shrink-0 text-xs text-light-500">{{ timeAgo }}</span>
    </div>
    <div class="flex flex-col gap-0.5">
      <h4 class="truncate text-sm font-semi-bold text-white/90">{{ subject }}</h4>
      <p class="truncate text-xs font-regular text-light-500">{{ preview }}</p>
    </div>
  </div>
</template>
