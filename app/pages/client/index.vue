<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: clients, pending } = await useFetch<ClientItem[]>('/api/client', {
  default: () => [],
})
</script>

<template>
  <main class="flex size-full overflow-hidden bg-dark-400">
    <div class="flex flex-1 flex-col overflow-y-auto p-3 md:p-6">
      <!-- Loading Skeleton -->
      <div v-if="pending" class="flex flex-col gap-3">
        <div v-for="i in 8" :key="i" class="h-20 w-full animate-pulse rounded-xl bg-white/5" />
      </div>

      <!-- Clients List -->
      <div v-else-if="clients && clients.length > 0" class="flex flex-col gap-3">
        <CardClientRow v-for="client in clients" :key="client.id" :item="client" />
      </div>

      <!-- Empty State -->
      <div v-else class="flex h-full flex-col items-center justify-center text-white/40">
        <NuxtIcon name="local:user" class="mb-4 text-5xl opacity-50" />
        <p class="text-base font-semi-bold">No clients found.</p>
        <p class="mt-1 text-sm text-light-500">Add clients in your workspace to manage contacts here.</p>
      </div>
    </div>
  </main>
</template>
