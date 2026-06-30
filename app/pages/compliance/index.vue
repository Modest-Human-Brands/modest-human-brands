<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: compliances, pending } = await useFetch('/api/compliance')
</script>

<template>
  <main class="flex size-full min-h-screen select-none flex-col bg-dark-400 pt-2 md:pt-4">
    <div class="mx-auto flex size-full flex-1 flex-col">
      <div class="flex flex-col overflow-hidden border-y border-white/10 shadow-2xl">
        <div v-if="pending" class="flex flex-col">
          [cite: 15]
          <div v-for="i in 5" :key="i" class="py-4.5 flex items-center justify-between border-b border-white/5 px-6">
            <div class="h-4 w-48 animate-pulse rounded bg-white/5" />
            <div class="hidden h-4 w-32 animate-pulse rounded bg-white/5 md:block" />
            <div class="hidden h-4 w-36 animate-pulse rounded bg-white/5 md:block" />
            <div class="hidden h-5 w-16 animate-pulse rounded-full bg-white/5 md:block" />
            <div class="h-4 w-4 animate-pulse rounded bg-white/5" />
          </div>
        </div>

        <div v-else-if="!compliances?.length" class="flex flex-col items-center justify-center py-16 text-light-500/40">
          <NuxtIcon name="local:folder" class="mb-3 text-4xl" />
          <p class="text-xs font-semi-bold">No compliance records found.</p>
        </div>

        <div v-else class="flex flex-col">
          <CardComplianceRow v-for="item in compliances" :key="item.id" :item="item" />
        </div>
      </div>
    </div>
  </main>
</template>
