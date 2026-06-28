<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: compliances, pending } = await useFetch('/api/compliance')
</script>

<template>
  <main class="flex size-full overflow-hidden bg-dark-400">
    <div class="flex flex-1 flex-col overflow-y-auto p-4 md:p-8">
      <div v-if="pending" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="i in 10" :key="i" class="w-full animate-pulse rounded-2xl bg-white/5 pt-[75%]"></div>
      </div>

      <nav v-else-if="compliances && compliances.length > 0" class="flex flex-col gap-1.5">
        <NuxtLink
          v-for="item in compliances"
          :key="item.id"
          :to="`/compliance/${item.slug}`"
          class="font-medium group flex items-center gap-3.5 rounded-xl px-4 py-3 text-base text-light-400 transition-all hover:bg-white/5 hover:pl-5 hover:text-white">
          <NuxtIcon name="local:folder" class="text-xl text-light-500 transition-colors group-hover:text-primary-400" />
          <span class="underline-offset-4 group-hover:underline">{{ item.title }}</span>
          <span v-if="item.updatedAt" class="font-mono ml-auto hidden text-sm text-light-600 md:inline">
            Updated
            <NuxtTime :datetime="item.updatedAt" hour="2-digit" minute="2-digit" hour-cycle="h11" />
          </span>
        </NuxtLink>
      </nav>

      <div v-else class="flex h-full flex-col items-center justify-center text-white/40">
        <NuxtIcon name="local:folder" class="mb-4 text-4xl opacity-50" />
        <p class="font-semibold text-sm">No compliances found.</p>
      </div>
    </div>
  </main>
</template>
