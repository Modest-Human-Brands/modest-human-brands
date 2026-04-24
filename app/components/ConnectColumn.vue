<script setup lang="ts">
import type { Connect } from '~/types/connect'

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
        <span class="text-xs text-light-500">{{ connects.length }}</span>
      </div>
      <div class="flex gap-2 text-light-500">
        <button class="hover:text-white">
          <NuxtIcon name="local:plus" />
        </button>
        <button class="hover:text-white">
          <NuxtIcon name="local:dots-three-bold" />
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <CardConnect v-for="item in connects" :key="item.id" :connect="item" @select="$emit('select-connect', item)" />
    </div>
  </div>
</template>
