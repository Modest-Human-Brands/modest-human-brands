<script setup lang="ts">
const props = defineProps<{ orgSlug: string; streamCollection: ProjectStreamCollection }>()

const now = useNow({ interval: 1000 })

const views = '100k'
const duration = computed(() => {
  if (!props.streamCollection.createdAt || props.streamCollection.status !== StreamStatus.Live) return null
  const elapsed = Math.floor((now.value.getTime() - new Date(props.streamCollection.createdAt).getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(s).padStart(2, '0')].filter(Boolean).join(':')
})

const { share, isSupported } = useShare()

function shareStream(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  const url = `${window.location.origin}/sync/public/${props.orgSlug}/${props.streamCollection.slug}`
  if (isSupported.value) {
    share({ title: props.streamCollection.title, url })
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const client = computed(() => ({
  name: props.streamCollection.client?.name ?? 'Anyomouns',
  avatar: props.streamCollection.client?.avatar ?? '/logo.png',
}))
</script>

<template>
  <div class="relative flex w-full max-w-[51rem] flex-col-reverse gap-3 pb-2 pr-6 md:flex-row md:justify-between md:gap-8 md:pb-8 md:pr-0">
    <NuxtLink
      :to="`/sync/${streamCollection.slug}`"
      class="group grid w-full max-w-2xl grid-flow-col grid-cols-[auto_min-content] grid-rows-[repeat(5,min-content)] gap-1.5 rounded-xl border border-white/5 bg-dark-500 p-3 hover:border-white/15 md:gap-2 md:rounded-2xl">
      <!-- Status -->
      <span class="flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm transition" :class="[streamCollection.status === 'live' ? 'bg-alert-500' : 'bg-dark-400']">
        <span v-if="streamCollection.status === 'live'" class="relative flex size-2">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
          <span class="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        <span class="font-semibold text-xs uppercase tracking-wider text-white">{{ streamCollection.status }}</span>
      </span>
      <!-- Status -->
      <h3 class="font-semibold text-base capitalize text-white md:text-lg">
        {{ streamCollection.title }}
      </h3>
      <span class="text-sm opacity-60 md:text-base">{{ streamCollection.slug }}</span>
      <div class="flex items-center gap-2">
        <NuxtImg :src="client.avatar" :alt="client.name" class="size-6 rounded-full object-cover" />
        <span class="text-sm opacity-60 md:text-base">{{ client.name }}</span>
      </div>
      <div class="flex gap-2 whitespace-nowrap">
        <div class="-space-x-3">
          <img
            v-for="{ deviceId, poster } in streamCollection.streams"
            :key="deviceId"
            :src="poster"
            :alt="deviceId"
            class="inline-block size-7 rounded-full border border-black bg-black object-cover" />
        </div>
        <div class="text-neutral-500 flex items-center gap-2 text-sm md:text-base">
          <span class="flex items-center justify-center gap-1">
            <NuxtIcon name="local:eye" class="text-[16px]" />
            {{ views }}
          </span>
          <span class="flex items-center justify-center gap-1">
            <NuxtIcon name="local:hour" class="text-[16px]" />
            {{ duration }}
          </span>
        </div>
      </div>
      <NuxtImg
        :src="streamCollection.poster"
        :alt="streamCollection.title"
        width="160"
        height="160"
        class="col-start-2 row-span-4 row-start-1 aspect-square min-w-24 rounded-lg object-cover md:min-w-28" />

      <button
        v-if="streamCollection.status === 'live'"
        type="button"
        class="col-start-2 row-start-5 inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-dark-400 px-2 py-0.5 text-xs text-white/80 hover:bg-dark-600 md:px-4 md:py-1 md:text-sm"
        @click="shareStream">
        <NuxtIcon name="local:link" class="text-[16px] md:text-[24px]" />
        Share
      </button>
    </NuxtLink>
    <div class="absolute right-2 top-1 flex h-full flex-col items-center md:right-28">
      <div
        class="relative mt-1 h-full w-px border-l-2 border-dashed border-dark-500 before:absolute before:-left-px before:top-0 before:size-2.5 before:-translate-x-1/2 before:rounded-full before:bg-dark-500" />
    </div>
    <NuxtTime :datetime="streamCollection.createdAt" month="short" day="numeric" year="numeric" class="w-fit self-end md:w-[5.5rem] md:self-start" />
  </div>
</template>
