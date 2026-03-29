<script setup lang="ts">
definePageMeta({ layout: false })

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
const setApproval = (itemSlug: string, state: ApprovalState) => {
  approvals.value.get(itemSlug) === state ? approvals.value.delete(itemSlug) : approvals.value.set(itemSlug, state)
  approvals.value = new Map(approvals.value)
}

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
  <div class="scrollbar-hidden flex h-dvh flex-col overflow-hidden">
    <!-- Organization -->
    <CardOrganization :organization="organization" class="absolute right-4 top-4 z-20 md:right-1/2 md:translate-x-1/2" />
    <!-- Header -->
    <div class="relative shrink-0 overflow-hidden transition-[height,opacity] duration-500 ease-in-out" :class="collapsed ? 'h-0 opacity-0' : 'h-60 opacity-100'">
      <NuxtImg
        v-if="media?.mediaItems?.[0]?.thumbnailUrl"
        :src="extractCdnId(media.mediaItems[0].thumbnailUrl)"
        :width="1280"
        :height="Math.round(1280 / (2 / 1))"
        fit="cover"
        :placeholder="[320, Math.round(320 / (2 / 1)), 50, 5]"
        class="absolute inset-0 size-full object-cover"
        @contextmenu.prevent />
      <div v-else class="absolute inset-0" />
      <div class="absolute inset-0 bg-gradient-to-t from-dark-600 via-dark-600/60 to-dark-600/10" />
      <div class="relative z-10 flex h-full flex-col items-center justify-end px-4 pb-5 text-center">
        <h1 v-if="media" class="text-3xl font-light leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
          {{ media.title }}
        </h1>
        <div v-if="media" class="mt-2 flex items-center gap-2">
          <NuxtTime :datetime="media.date" class="text-xs text-white md:text-base" day="numeric" month="short" year="numeric" />
          <span class="text-2xs">·</span>
          <span class="text-2xs font-semi-bold uppercase text-light-400 sm:text-xs"> {{ totalMedia }} pics </span>
          <span
            class="rounded-full px-2 py-0.5 text-3xs font-bold uppercase sm:text-2xs"
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
    <nav ref="tabs" class="scrollbar-none flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.06] bg-dark-600 px-2 py-2.5 sm:gap-1.5 sm:px-3 sm:py-3">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :data-active="activeTab === tab.id"
        class="shrink-0 rounded-full px-3 py-1 text-2xs font-semi-bold transition-all duration-200 sm:px-4 sm:py-1.5 sm:text-xs"
        :class="activeTab === tab.id ? 'text-white' : 'text-light-400 hover:text-white'"
        :style="activeTab === tab.id ? { backgroundColor: organization.branding.color.primary } : {}"
        @click="activeTab = tab.id">
        {{ tab.label }} ({{ tab.count }})
      </button>
    </nav>
    <!-- Media Grid -->
    <main ref="scroll" class="scrollbar-hidden flex-1 overflow-y-auto">
      <div v-if="isLoading" class="grid grid-cols-2 gap-0.5 p-0.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div v-for="i in 12" :key="i" class="animate-pulse rounded-sm" :style="{ aspectRatio: ['4/3', '1/1', '3/4', '16/9', '2/3'][i % 5] }" />
      </div>

      <div v-else-if="filteredMedia && filteredMedia.length" class="grid grid-cols-2 gap-0.5 p-0.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <CardMedia
          v-for="item in filteredMedia"
          :is-public="true"
          :key="item.slug"
          :project-slug="slug"
          :media="item"
          :status="approvals.get(item.slug)"
          @update="(value) => setApproval(item.slug, value)" />
      </div>
      <div v-else class="flex h-48 flex-col items-center justify-center gap-2 text-light-400/25">
        <NuxtIcon name="local:photo" class="size-10" />
        <p class="text-sm">No media in this category</p>
      </div>
    </main>
  </div>
</template>
