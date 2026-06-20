<script setup lang="ts">
defineProps<{
  template: {
    id: string
    label?: string
    description?: string
  }
}>()
</script>

<template>
  <NuxtLink
    :to="`/doc/new/${template.id}`"
    class="group flex flex-col items-start gap-4 rounded-2xl border border-dark-500 bg-dark-500/50 p-6 text-left transition-all hover:border-dark-400 hover:bg-dark-500">
    <div class="flex size-12 items-center justify-center rounded-xl bg-dark-600 text-light-400 transition-colors group-hover:text-white">
      <NuxtIcon name="local:document" class="text-2xl" />
    </div>
    <div>
      <h2 class="text-lg font-bold capitalize text-white">{{ template.label || template.id.replace(/-/g, ' ') }}</h2>
      <p class="mt-1 text-sm text-light-500">
        {{ template.description || 'Generate a new document using this template.' }}
      </p>
    </div>
  </NuxtLink>
</template>
