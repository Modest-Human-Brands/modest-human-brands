<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
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
      <div class="grid grid-flow-col grid-cols-[auto_auto_auto] grid-rows-2 gap-2 md:gap-3">
        <h1 class="text-md col-span-2 md:text-xl">{{ project.title }}</h1>
        <NuxtTime :datetime="project.date" class="text-xs text-white md:text-base" day="numeric" month="short" year="numeric" />
        <div v-if="project.client" class="col-start-3 flex items-center gap-2 justify-self-end">
          <NuxtImg v-if="project.client.avatar" :src="project.client.avatar" :alt="project.client.name" :width="32" :height="32" class="size-8 rounded-full border border-black/50 object-cover" />
          <span class="truncate">{{ project.client.name }}</span>
        </div>
        <div class="col-span-2 flex flex-wrap items-center gap-2 justify-self-end text-xs text-white/70 md:text-base">
          <div class="inline-flex items-center gap-2">
            <span class="size-3 rounded-full" :class="project.status === 'Delivered' ? 'bg-success-500' : 'bg-white/40'" />
            <span class="text-white/75">{{ project.status }}</span>
          </div>
          <span>·</span>
          <span>{{ project.mediaCount.photo }} Photos {{ project.mediaCount.video }} Videos</span>
        </div>
      </div>
      <!-- MediaGrid -->
      <div class="mt-8 flex-1 overflow-y-auto">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CardMedia v-for="item in project.mediaItems" :key="item.slug" v-bind="item" />
        </div>
      </div>
    </template>
  </section>
</template>
