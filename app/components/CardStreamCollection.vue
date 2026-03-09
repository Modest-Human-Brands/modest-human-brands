<script setup lang="ts">
const props = defineProps<{ orgSlug: string; streamCollection: ProjectStreamCollection }>()

const views = '100k'
const duration = '10 min'

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
  avatar: props.streamCollection.client?.avatar ?? '/logo.png'
}))
</script>

<template>
  <div
    class="relative w-full max-w-[51rem]  flex flex-col-reverse md:flex-row gap-3 md:gap-8 md:justify-between pr-6 pb-6  md:pr-0 md:pb-8">
    <NuxtLink :to="`/sync/${streamCollection.slug}`"
      class="group rounded-xl  md:rounded-2xl border border-white/5 bg-dark-500   hover:border-white/15 max-w-2xl p-3 grid grid-rows-[repeat(5,min-content)] w-full grid-cols-[auto_min-content] grid-flow-col gap-1.5  md:gap-2">
      <!-- Status -->
      <span class="flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm transition w-fit"
        :class="[streamCollection.status === 'live' ? 'bg-alert-500' : 'bg-dark-400']">
        <span v-if="streamCollection.status === 'live'" class="relative flex size-2">
          <span class="absolute inline-flex size-full animate-ping rounded-full opacity-75 bg-white" />
          <span class="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        <span class="font-semibold text-xs uppercase tracking-wider text-white">{{ streamCollection.status }}</span>
      </span>
      <!-- Status -->
      <h3 class="font-semibold text-base md:text-lg text-white capitalize">
        {{ streamCollection.title }}
      </h3>
      <span class="text-sm md:text-base opacity-60">{{ streamCollection.slug }}</span>
      <div class="flex items-center gap-2">
        <NuxtImg :src="client.avatar" :alt="client.name" class="size-6 rounded-full object-cover" />
        <span class="text-sm md:text-base opacity-60">{{ client.name }}</span>
      </div>
      <div class="flex gap-2 whitespace-nowrap">
        <div class="-space-x-3">
          <img v-for="{ deviceId } in streamCollection.streams" :key="deviceId"
            :src="`https://api.dicebear.com/9.x/glass/svg?seed=${deviceId}`" :alt="deviceId"
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
      <NuxtImg :src="streamCollection.poster" :alt="streamCollection.title" width="160" height="160"
        class="object-cover col-start-2  row-start-1 row-span-4 rounded-lg min-w-24 md:min-w-28 aspect-square" />

      <button v-if="streamCollection.status === 'live'" type="button"
        class="col-start-2 row-start-5 inline-flex shrink-0 justify-center items-center gap-1 rounded-full bg-dark-400 px-2 py-0.5 md:px-4 md:py-1 text-xs md:text-sm text-white/80 hover:bg-dark-600"
        @click="shareStream">
        <NuxtIcon name="local:link" class="text-[16px] md:text-[24px]" />
        Share
      </button>
    </NuxtLink>
    <div class="absolute right-2 top-1 md:right-28 flex flex-col items-center h-full">
      <div
        class="relative w-px h-full border-l-2 border-dashed border-dark-500 mt-1 before:size-2.5 before:absolute before:top-0 before:-left-px before:-translate-x-1/2 before:rounded-full before:bg-dark-500" />
    </div>
    <NuxtTime :datetime="streamCollection.date" month="short" day="numeric" year="numeric"
      class="md:w-[5.5rem] self-end md:self-start w-fit" />
  </div>
</template>
