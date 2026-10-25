<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: sites, pending } = await useFetch('/api/site', { default: () => [] })
</script>

<template>
  <main class="flex size-full select-none overflow-hidden bg-dark-400">
    <div class="flex size-full flex-1 flex-col gap-4 overflow-y-auto p-6 md:p-10">
      <div v-if="pending" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
      </div>

      <div v-else-if="sites?.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TemplateCard v-for="site in sites" :id="site.slug" :key="site.slug" :label="site.name" :description="`${site.slug} · ${site.templateId}`" :link="`/site/${site.slug}`" />
      </div>

      <div v-else class="my-auto flex h-full flex-col items-center justify-center text-light-500/40">
        <NuxtIcon name="local:globe" class="mb-3 text-4xl" />
        <p class="text-xs font-semi-bold">No sites yet.</p>
      </div>
    </div>
  </main>
</template>
