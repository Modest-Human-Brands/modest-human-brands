<script setup lang="ts">
interface FormattedProject {
  id: string
  title: string
  slug: string
  status: ProjectStatus
  budget?: number
  quoteNumber?: number
  shootLocation?: string
  shootDate?: string
  coverUrl?: string
  iconUrl?: string
  assetCount: number
  contactCount: number
}

const props = defineProps<{
  project: FormattedProject
}>()

// Maps to the exact dot/pill style seen in the image
const statusConfig: Record<string, { dot: string; bg: string; text: string }> = {
  Plan: { dot: 'bg-light-500', bg: 'bg-white/5', text: 'text-light-500' },
  Quotation: { dot: 'bg-warning-500', bg: 'bg-warning-500/10', text: 'text-warning-500' },
  Shoot: { dot: 'bg-primary-400', bg: 'bg-primary-500/10', text: 'text-primary-400' },
  Edit: { dot: 'bg-primary-600', bg: 'bg-primary-600/10', text: 'text-primary-500' },
  Delivered: { dot: 'bg-success-500', bg: 'bg-success-500/10', text: 'text-success-500' },
}

// Generates a consistent gradient placeholder based on the project ID
const placeholderGradients = ['from-primary-600/40 to-dark-400', 'from-success-600/40 to-dark-400', 'from-warning-600/40 to-dark-400', 'from-alert-600/40 to-dark-400', 'from-light-500/30 to-dark-400']

const placeholderGradient = computed(() => {
  const id = props.project.id || ''
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return placeholderGradients[Math.abs(hash) % placeholderGradients.length]
})

function formatDate(dateStr?: string) {
  if (!dateStr) return 'No Date'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <NuxtLink
    :to="`/project/${project.id}`"
    class="group relative flex flex-col overflow-hidden rounded-lg border border-dark-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-dark-600 sm:hover:-translate-y-1">
    <div class="absolute right-4 top-4 z-50 flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-0.5">
      <div class="size-1.5 rounded-full" :class="statusConfig[project.status]?.dot || 'bg-light-500'" />
      <span class="text-sm font-semi-bold tracking-wide text-black">{{ project.status }}</span>
    </div>

    <div class="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100">
      <div class="absolute -top-12 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-primary-500/20 blur-[40px]" />
    </div>

    <div class="relative z-10 p-1.5 pb-0 sm:p-2 sm:pb-0">
      <div class="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-dark-600 shadow-inner">
        <NuxtImg
          v-if="project.coverUrl"
          :src="project.coverUrl"
          :alt="project.name"
          class="size-full object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />
        <div v-else class="size-full bg-gradient-to-br opacity-80 transition-transform duration-700 group-hover:scale-105" :class="placeholderGradient" />

        <div class="absolute inset-0 ring-1 ring-inset ring-black/20" />
      </div>
    </div>

    <div class="relative z-10 flex flex-col gap-3 p-3.5 sm:gap-4 sm:p-5">
      <div class="flex items-start justify-between gap-3 sm:gap-4">
        <h3 class="line-clamp-2 text-base font-semi-bold leading-snug text-white transition-colors group-hover:text-primary-400 sm:text-lg">
          {{ project.title }}
        </h3>
      </div>

      <div class="flex flex-col gap-2">
        <!-- Fluid text sizing prevents multi-line wrapping in narrow mobile columns -->
        <div class="flex items-center gap-2 text-xs font-regular text-light-500 sm:text-sm">
          <NuxtIcon name="local:calendar" class="shrink-0 text-sm opacity-60" />
          <span class="truncate">{{ formatDate(project.shootDate) }}</span>
        </div>
        <div v-if="project.shootLocation" class="flex items-center gap-2 text-xs font-regular text-light-500 sm:text-sm">
          <NuxtIcon name="local:map" class="shrink-0 text-sm opacity-60" />
          <span class="truncate">{{ project.shootLocation }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
