<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

export type ApprovalState = 'approved' | 'rejected'

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: organizationData } = await useFetch(`/api/organization/${slug}`)

const DEFAULT_ORG = {
  name: 'Modest Human Brands',
  website: 'https://modesthumanbrands.com',
  branding: {
    logo: 'https://modesthumanbrands.com/logo.svg',
    color: { primary: '#4A85FF', accent: '' },
    font: '',
  },
  phone: '+912269711501',
  whatsapp: 'https://wa.me/912269711501',
}
const organization = computed(() => organizationData.value ?? (DEFAULT_ORG as Organization))

const { data: media, status: projectStatus } = await useFetch<ProjectDetail>(`/api/media/${slug}`)
const isLoading = computed(() => projectStatus.value === 'pending')

const approvals = ref(new Map<string, ApprovalState>())

const totalMedia = computed(() => (media.value?.mediaCount.photo ?? 0) + (media.value?.mediaCount.video ?? 0))

const allMedia = computed(() => ({
  unset: media.value?.mediaItems.filter((m) => approvals.value.get(m.slug) === undefined),
  approved: media.value?.mediaItems.filter((m) => approvals.value.get(m.slug) === 'approved'),
  rejected: media.value?.mediaItems.filter((m) => approvals.value.get(m.slug) === 'rejected'),
}))

const tabs = computed(() => [
  { id: 'unset' as const, label: 'All', count: allMedia.value.unset?.length },
  { id: 'approved' as const, label: 'Approved', count: allMedia.value.approved?.length },
  { id: 'rejected' as const, label: 'Not Approved', count: allMedia.value.rejected?.length },
])
const activeTab = ref<'unset' | 'approved' | 'rejected'>('unset')

const filteredMedia = computed(() => allMedia.value[activeTab.value])

const scrollRef = useTemplateRef<HTMLDivElement>('scroll')
const { y } = useScroll(scrollRef)
const collapsed = computed(() => y.value > 40)

const tabsRef = useTemplateRef<HTMLDivElement>('tabs')
watch(activeTab, () => nextTick(() => tabsRef.value?.querySelector('[data-active="true"]')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })))
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden">
    <!-- Header -->
    <div class="relative shrink-0 overflow-hidden transition-[height,opacity] duration-500 ease-in-out" :class="collapsed ? 'h-0 opacity-0' : 'h-60 opacity-100'">
      <NuxtImg
        v-if="media?.mediaItems?.[0]?.thumbnailUrl"
        :src="extractCdnId(media.mediaItems[0].thumbnailUrl)"
        :width="1280"
        :height="Math.round(1280 / (2 / 1))"
        fit="cover"
        :placeholder="[320, Math.round(320 / (2 / 1)), 50, 5]"
        class="absolute inset-0 size-full object-cover" />
      <div v-else class="absolute inset-0" />
      <div class="absolute inset-0 bg-gradient-to-t from-dark-600 via-dark-600/60 to-dark-600/10" />
      <div class="relative z-10 flex h-full flex-col items-center justify-end px-4 pb-5 text-center">
        <h1 v-if="media" class="text-3xl font-light leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {{ media.title }}
        </h1>
        <div v-if="media" class="mt-2 flex items-center gap-2">
          <NuxtTime :datetime="media.date" class="text-xs text-white md:text-base" day="numeric" month="short" year="numeric" />
          <span class="text-xs">·</span>
          <span class="text-xs font-semi-bold uppercase text-light-400 md:text-xs"> {{ totalMedia }} pics </span>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-bold uppercase md:text-xs"
            :class="{
              'bg-light-400/10 text-light-400': media.status === 'Plan',
              'bg-primary-400/20 text-primary-400': media.status === 'Quotation',
              'bg-warning-500/20 text-warning-500': media.status === 'Shoot',
              'bg-primary-500/20 text-primary-500': media.status === 'Edit',
              'bg-success-500/20 text-success-500': media.status === 'Delivered',
            }">
            {{ media.status }}
          </span>
        </div>
      </div>
    </div>
    <!-- Tabs -->
    <nav ref="tabs" class="scrollbar-none flex shrink-0 gap-1 overflow-x-auto px-2 py-2.5 md:gap-1.5 md:py-3">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :data-active="activeTab === tab.id"
        class="shrink-0 rounded-full px-3 py-1 text-xs font-semi-bold transition-all duration-200 md:px-4 md:py-1.5 md:text-xs"
        :class="activeTab === tab.id ? 'text-white' : 'text-light-400 hover:text-white'"
        :style="activeTab === tab.id ? { backgroundColor: organization.branding.color.primary } : {}"
        @click="activeTab = tab.id">
        {{ tab.label }} ({{ tab.count }})
      </button>
    </nav>
    <!-- Media Grid -->
    <main ref="scroll" class="scrollbar-hidden flex-1 overflow-y-auto">
      <div v-if="isLoading" class="grid grid-cols-2 gap-0.5 p-0.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div v-for="i in 12" :key="i" class="animate-pulse rounded-sm" :style="{ aspectRatio: ['4/3', '1/1', '3/4', '16/9', '2/3'][i % 5] }" />
      </div>

      <div v-else-if="filteredMedia && filteredMedia.length" class="grid grid-cols-2 gap-0.5 p-0.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <CardMedia v-for="item in filteredMedia" :key="item.slug" :is-public="false" :project-slug="slug" :media="item" />
      </div>
      <div v-else class="flex h-full flex-col items-center justify-center gap-2 text-light-400/25">
        <NuxtIcon name="local:photo" class="size-10" />
        <p class="text-sm">No media in this category</p>
      </div>
    </main>
  </div>
</template>
