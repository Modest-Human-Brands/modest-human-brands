<script setup lang="ts">
const props = defineProps<{
  projects: {
    id: string
    title: string
    period: { start: string; end: string }
  }[]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const { x: scrollX } = useScroll(scrollContainer)
const { width: containerWidth } = useElementSize(scrollContainer)

const TOTAL_DAYS = 20000
const CENTER_INDEX = 10000

const colWidth = computed(() => {
  if (!containerWidth.value) return 120
  if (containerWidth.value < 768) return Math.max(100, containerWidth.value / 3.5)
  if (containerWidth.value < 1024) return Math.max(110, containerWidth.value / 5)
  return Math.max(120, containerWidth.value / 7)
})

const EPOCH = new Date()
EPOCH.setHours(12, 0, 0, 0)

const getDayIndex = (isoString: string) => {
  const d = new Date(isoString)
  d.setHours(12, 0, 0, 0)
  const diffDays = Math.round((d.getTime() - EPOCH.getTime()) / 86400000)
  return CENTER_INDEX + diffDays
}

const isInitialized = ref(false)

watchEffect(() => {
  if (!isInitialized.value && containerWidth.value > 0 && scrollContainer.value) {
    scrollContainer.value.scrollLeft = (CENTER_INDEX - 2) * colWidth.value
    isInitialized.value = true
  }
})

const computedProjects = computed(() => {
  const rows: number[] = []

  const sorted = [...props.projects].sort((a, b) => getDayIndex(a.period.start) - getDayIndex(b.period.start))

  return sorted.map((project) => {
    const iStart = getDayIndex(project.period.start)
    const iEnd = getDayIndex(project.period.end)

    const left = (iStart + 0.5) * colWidth.value
    const width = Math.max(1, iEnd - iStart + 1) * colWidth.value

    let rowIndex = rows.findIndex((rowEnd) => rowEnd < iStart)
    if (rowIndex === -1) {
      rowIndex = rows.length
      rows.push(iEnd)
    } else {
      rows[rowIndex] = iEnd
    }

    return {
      ...project,
      iStart,
      iEnd,
      computedStyle: {
        left: `${left}px`,
        width: `${width}px`,
        top: `${rowIndex * 32 + 36}px`,
      },
    }
  })
})

const containerHeight = computed(() => {
  if (!computedProjects.value.length) return 96
  return Math.max(96, Math.max(...computedProjects.value.map((p) => parseInt(p.computedStyle.top))) + 64)
})

const visibleDays = computed(() => {
  const start = Math.max(0, Math.floor(scrollX.value / colWidth.value) - 2)
  const end = Math.min(TOTAL_DAYS, Math.ceil((scrollX.value + containerWidth.value) / colWidth.value) + 2)

  const days = []
  for (let i = start; i <= end; i++) {
    const d = new Date(EPOCH.getTime() + (i - CENTER_INDEX) * 86400000)
    days.push({ index: i, label: useDateFormat(d, 'D MMMM').value })
  }
  return days
})

const visibleProjects = computed(() => {
  const start = Math.floor(scrollX.value / colWidth.value) - 2
  const end = Math.ceil((scrollX.value + containerWidth.value) / colWidth.value) + 2

  return computedProjects.value.filter((p) => p.iEnd >= start && p.iStart <= end)
})
</script>

<template>
  <section ref="scrollContainer" class="scrollbar-hidden flex max-h-80 flex-col overflow-auto scroll-smooth rounded-lg bg-dark-500 p-4 pb-6">
    <div class="relative transition-all duration-300" :style="{ width: `${TOTAL_DAYS * colWidth}px`, height: `${containerHeight}px` }">
      <div v-for="day in visibleDays" :key="day.index" class="absolute bottom-0 top-0" :style="{ left: `${day.index * colWidth}px`, width: `${colWidth}px` }">
        <div class="text-center text-xs text-light-500 md:text-sm">{{ day.label }}</div>
        <div class="absolute bottom-0 left-1/2 top-8 w-0.5 -translate-x-1/2 bg-white" />
      </div>

      <NuxtLink
        v-for="project in visibleProjects"
        :key="project.id"
        :to="`/project/${project.id}`"
        :style="project.computedStyle"
        class="absolute z-10 flex h-7 items-center truncate rounded-l-sm rounded-r-full border-l-4 border-info-500 bg-dark-600 px-3 text-xs shadow-sm backdrop-blur-sm transition hover:bg-white/20 md:text-sm">
        <span class="truncate text-white">{{ project.title }}</span>
      </NuxtLink>
    </div>
  </section>
</template>
