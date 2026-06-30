<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})
</script>

<template>
  <main class="flex size-full overflow-hidden bg-dark-400">
    <div class="flex flex-1 flex-col overflow-y-auto p-4 md:p-8">
      <!-- <div v-if="pending" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="i in 10" :key="i" class="w-full animate-pulse rounded-2xl bg-white/5 pt-[75%]"></div>
      </div>

      <div v-else-if="folders && folders.length > 0" class="grid grid-cols-2 justify-between gap-4 lg:grid-cols-4">
        <DocFolderCard v-for="folder in folders" :key="folder.id" :folder="folder" />
      </div> -->

      <div class="flex h-full flex-col items-center justify-center text-white/40">
        <NuxtIcon name="local:journal" class="mb-4 text-4xl opacity-50" />
        <p class="text-sm font-semi-bold">No transactions found.</p>
      </div>
    </div>
  </main>
</template>
