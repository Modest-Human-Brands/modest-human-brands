<script setup lang="ts">
const props = defineProps<{ connect: Connect }>()

defineEmits(['select'])

const initial = computed(() => props.connect.name[0])

const getIconName = (platform: string) => {
  const map: Record<string, string> = {
    whatsapp: 'local:whatsapp',
    email: 'local:envelope',
    call: 'local:phone',
    instagram: 'local:instagram',
  }
  return map[platform] || 'local:dots'
}
</script>

<template>
  <div class="group cursor-pointer rounded-xl bg-dark-500 p-4 transition-all hover:bg-dark-600" @click="$emit('select')">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold leading-none text-dark-400">
          {{ initial }}
        </div>
        <div>
          <h4 class="text-sm font-semi-bold text-white">{{ connect.name }}</h4>
          <p class="text-xs text-white">{{ connect.company }}</p>
          <p class="mt-1 text-xs text-white">{{ connect.lastActive }}</p>
        </div>
      </div>

      <div class="flex gap-1.5 opacity-60 group-hover:opacity-100">
        <div v-for="platform in connect.platforms" :key="platform" class="text-white">
          <NuxtIcon :name="getIconName(platform)" class="h-4 w-4" />
        </div>
      </div>
    </div>
  </div>
</template>
