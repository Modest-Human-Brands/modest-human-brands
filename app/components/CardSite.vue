<script setup lang="ts">
const props = defineProps<{
  site: SiteSummary
}>()

const config = useRuntimeConfig()
const liveUrl = computed(() => `${config.public.wapUrl}/${props.site.slug}`)
</script>

<template>
  <div class="group relative flex flex-col gap-4 rounded-xl border border-dark-500/60 bg-dark-500/20 p-5 transition-all duration-200 ease-out hover:border-dark-400 hover:bg-dark-500/50">
    <div class="flex w-full items-start justify-between gap-2">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dark-600 text-light-400 transition-colors duration-200 group-hover:bg-accent-500/10 group-hover:text-accent-400">
        <NuxtIcon name="local:globe" class="text-xl" />
      </div>

      <a
        :href="liveUrl"
        target="_blank"
        rel="noopener"
        class="relative z-10 rounded-full border border-dark-400 px-3 py-1 text-xs font-semi-bold text-light-400 transition-colors hover:border-accent-500 hover:text-white"
        >View live</a
      >
    </div>

    <div class="flex min-w-0 flex-col gap-1">
      <h2 class="truncate text-base font-semi-bold capitalize text-white">{{ site.name }}</h2>
      <p class="truncate text-sm leading-relaxed text-light-500">{{ site.slug }} · {{ site.templateId }}</p>
    </div>

    <!-- The whole card opens the editor; the live link above sits over it -->
    <NuxtLink
      :to="`/site/${site.slug}`"
      class="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500"
      :aria-label="`Edit ${site.name}`" />
  </div>
</template>
