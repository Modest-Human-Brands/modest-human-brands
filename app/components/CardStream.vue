<script setup lang="ts">
interface ProjectStream {
  slug: string
  deviceId: string
  title: string
  status: StreamStatus
  poster: string
  streamUrl: string
  media: string
  client?: ProjectClient
}

const props = defineProps<ProjectStream>()

const views = '100k'
const duration = '10 min'

const { share, isSupported } = useShare()

function shareStream(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  const url = `${window.location.origin}/public/sync/${props.slug}`
  if (isSupported.value) {
    share({ title: props.title, url })
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <NuxtLink
    :to="`/sync/${slug}`"
    class="bg-neutral-800/60 hover:bg-neutral-800 group flex h-24 cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-dark-500 transition-all duration-200 hover:border-white/15">
    <div class="relative w-40 shrink-0">
      <NuxtImg :src="poster" :alt="title" width="160" height="96" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <span class="font-medium absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-xs capitalize text-white backdrop-blur-sm"> {{ status }} </span>
    </div>
    <div class="flex min-w-0 flex-1 flex-col justify-between p-4">
      <div class="space-y-2.5">
        <h3 class="font-semibold line-clamp-2 text-[15px] leading-snug text-white">
          {{ title }}
        </h3>
        <div v-if="client" class="flex items-center gap-2">
          <NuxtImg :src="client.avatar" :alt="client.name" class="h-5 w-5 rounded-full object-cover" />
          <span class="text-neutral-400 text-sm">{{ client.name }}</span>
        </div>
      </div>
      <div class="text-neutral-500 mt-4 flex items-center gap-4 text-sm">
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="local:eye" class="text-[16px]" />
          {{ views }}
        </span>
        <span class="flex items-center gap-1.5">
          <NuxtIcon name="local:hour" class="text-[16px]" />
          {{ duration }}
        </span>
        <!-- Share button -->
        <button type="button" class="bg-neutral-700 hover:bg-neutral-600 ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white/80 md:hidden" @click="shareStream">
          <NuxtIcon name="local:link" class="text-[16px]" />
          Share
        </button>
      </div>
    </div>
    <!-- Share button -->
    <button
      type="button"
      class="bg-neutral-700 hover:bg-neutral-600 mr-3 hidden shrink-0 items-center gap-2 self-center rounded-full px-4 py-2 text-sm text-white/80 md:inline-flex"
      @click="shareStream">
      <NuxtIcon name="local:link" class="text-[24px]" />
      Share
    </button>
  </NuxtLink>
</template>
