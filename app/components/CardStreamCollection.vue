<script setup lang="ts">
const props = defineProps<{ orgSlug: string; streamCollection: ProjectStreamCollection }>()

const now = useNow({ interval: 1000 })

const views = '100k'
const isLive = computed(() => props.streamCollection.status === StreamStatus.Live)
const duration = computed(() => {
  if (!props.streamCollection.date || !isLive.value) return null
  const elapsed = Math.floor((now.value.getTime() - new Date(props.streamCollection.date).getTime()) / 1000)
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
  <!-- Figma: Card/Stream (352 wide, 2:1-ish poster, Share flush bottom-right) -->
  <NuxtLink :to="`/sync/${streamCollection.slug}`" class="relative block w-full max-w-[352px] shrink-0 overflow-hidden rounded bg-dark-500 pb-2 hover:bg-dark-600">
    <div class="relative aspect-[352/166] w-full overflow-hidden bg-dark-600">
      <NuxtImg :src="streamCollection.poster" :alt="streamCollection.title" width="704" height="332" class="size-full object-cover" />

      <span class="absolute left-1 top-1 flex items-center gap-1 rounded bg-dark-500 px-2 pb-[3px] pt-0.5 text-xs capitalize">
        <span v-if="isLive" class="size-2 rounded-full bg-alert-400" />
        {{ streamCollection.status }}
      </span>

      <span class="absolute right-1 top-1 grid size-6 place-items-center" aria-hidden="true">
        <NuxtIcon name="local:dots" class="rotate-90 text-base" />
      </span>

      <div v-if="duration" class="absolute bottom-1 left-1 flex items-center gap-2 rounded bg-dark-500 px-2 py-1 text-2xs">
        <span class="flex items-center gap-1">
          <NuxtIcon name="local:clock" class="text-sm" />
          {{ duration }}
        </span>
        <span class="flex items-center gap-1">
          <NuxtIcon name="local:eye" class="text-sm" />
          {{ views }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-1 px-2 pt-2">
      <div class="flex items-center justify-between gap-2">
        <h3 class="min-w-0 truncate text-base text-white">{{ streamCollection.title }}</h3>
        <span class="flex shrink-0 items-center gap-1 text-2xs">
          <NuxtIcon name="local:camera" class="text-sm" />
          {{ streamCollection.streams.length }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-2">
          <NuxtImg :src="extractCdnId(client.avatar)" :alt="client.name" fit="cover" loading="lazy" class="size-6 shrink-0 rounded-full object-cover" />
          <span class="truncate text-sm text-white/60">{{ client.name }}</span>
        </span>
        <span class="flex shrink-0 items-center gap-1 text-2xs">
          <NuxtIcon name="local:calendar" class="text-base" />
          <span class="flex flex-col text-right">
            <NuxtTime :datetime="streamCollection.date" month="long" day="numeric" year="numeric" />
            <NuxtTime :datetime="streamCollection.date" hour="numeric" minute="2-digit" />
          </span>
        </span>
      </div>

      <div class="flex min-h-7 items-center justify-between">
        <div class="-space-x-3">
          <NuxtImg
            v-for="{ deviceId, poster } in streamCollection.streams"
            :key="deviceId"
            :src="poster"
            :alt="deviceId"
            class="inline-block size-6 rounded-full border border-black bg-black object-cover" />
        </div>
        <button type="button" class="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-md bg-accent-500 px-2 py-1 text-2xs text-white hover:bg-accent-600" @click="shareStream">
          <NuxtIcon name="local:link" class="text-base" />
          Share
        </button>
      </div>
    </div>
  </NuxtLink>
</template>
