<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: project } = await useFetch(`/api/project/${slug}`)
</script>

<template>
  <section class="relative flex h-full flex-1 flex-col overflow-hidden">
    <!-- Empty State -->
    <template v-if="!project"> No Project Details Found </template>
    <!-- Success State -->
    <template v-else>
      <!-- ProjectHeader -->
      <div class="mt-8 grid grid-flow-col grid-cols-2 grid-rows-2 gap-3 text-base">
        <span class="text-xl">True Mens New Wallet</span>
        <span>Dec 22, 2025</span>
        <div class="flex items-center gap-2 justify-self-end">
          <NuxtImg :src="project.client.avatarUrl" :alt="project.client.name" :width="32" :height="32" class="size-8 rounded-full border border-black/50 object-cover" />
          <span class="truncate">{{ project.client.name }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2 justify-self-end text-white/70">
          <div class="inline-flex items-center gap-2">
            <span class="size-3 rounded-full" :class="project.status.delivered ? 'bg-success-500' : 'bg-white/40'" />
            <span class="text-white/75">{{ project.status.label }}</span>
          </div>
          <span>·</span>
          <span>{{ project.photosCount }} Photos {{ project.videosCount }} Videos</span>
        </div>
      </div>
      <!-- MediaGrid -->
      <div class="mt-8 flex-1 overflow-y-auto">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MediaCard v-for="item in project.mediaItems" :key="item.slug" v-bind="item" />
        </div>
      </div>
    </template>
  </section>
</template>
