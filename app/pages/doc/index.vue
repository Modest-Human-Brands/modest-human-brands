<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: folders, pending } = await useFetch('/api/doc', { default: () => [] })
</script>

<template>
  <main class="flex size-full select-none overflow-hidden bg-dark-400">
    <div class="flex size-full flex-1 flex-col overflow-y-auto p-6 md:p-10">
      <div v-if="pending" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="aspect-[4/3] w-full animate-pulse rounded-2xl bg-white/5" />
      </div>

      <div v-else-if="folders?.length" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DocFolderCard v-for="folder in folders" :key="folder.id" :folder="folder" />
      </div>

      <div v-else class="my-auto flex h-full flex-col items-center justify-center text-light-500/40">
        <NuxtIcon name="local:folder" class="mb-3 text-4xl" />
        <p class="text-xs font-semi-bold">No documents found.</p>
      </div>
    </div>
  </main>
</template>
