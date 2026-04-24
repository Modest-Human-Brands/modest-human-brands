<script setup lang="ts">
import type { Connect } from '~/types/connect'

const props = defineProps<{ connect: Connect }>()

defineEmits(['select'])

const initials = computed(() =>
  props.connect.name
    .split(' ')
    .map((n) => n[0])
    .join('')
)

const getIconName = (platform: string) => {
  const map: Record<string, string> = {
    whatsapp: 'ph:whatsapp-logo',
    email: 'ph:envelope-simple',
    call: 'ph:phone',
    instagram: 'ph:instagram-logo',
  }
  return map[platform] || 'ph:dots-three'
}
</script>

<template>
  <div class="group cursor-pointer rounded-xl bg-dark-500 p-4 transition-all hover:bg-dark-600" @click="$emit('select')">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-dark-600 text-sm font-bold text-white group-hover:bg-dark-400">
          {{ initials }}
        </div>
        <div>
          <h4 class="text-sm font-semi-bold text-white">{{ connect.name }}</h4>
          <p class="text-xs text-light-500">{{ connect.company }}</p>
          <p class="mt-1 text-xs text-light-400">{{ connect.lastActive }}</p>
        </div>
      </div>

      <div class="flex gap-1.5 opacity-60 group-hover:opacity-100">
        <div v-for="platform in connect.platforms" :key="platform" class="text-light-500">
          <NuxtIcon :name="getIconName(platform)" class="h-4 w-4" />
        </div>
      </div>
    </div>
  </div>
</template>
