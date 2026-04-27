<script setup lang="ts">
defineProps<{
  title: string
  connects: Connect[]
}>()

defineEmits(['select-connect'])
</script>

<template>
  <div class="flex min-w-[300px] flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semi-bold text-white">{{ title }}</h3>
        <span class="text-xs text-white">{{ connects.length }}</span>
      </div>
      <div class="flex gap-2 text-white">
        <button class="hover:text-white">
          <NuxtIcon name="local:plus" />
        </button>
        <button class="hover:text-white">
          <NuxtIcon name="local:dots" />
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <ConnectLeadCard v-for="item in connects" :key="item.id" :connect="item" @select="$emit('select-connect', item)" />
    </div>
  </div>
</template>
