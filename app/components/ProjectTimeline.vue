<script setup lang="ts">
const props = defineProps<{
  projects: {
    id: string
    title: string
    period: { start: string; end: string }
  }[]
}>()

const HEADER_HEIGHT = 36
const LANE_HEIGHT = 32
const DAY_MS = 86400000
// The axis is effectively endless: five years either side of today, with only the visible days rendered
const DAYS_EACH_SIDE = 1825

const root = ref<HTMLElement | null>(null)
const scroller = computed(() => containerProps.ref.value)

// The frame has a fixed height and is measured once mounted, so nothing shifts while the data or width settles
const width = ref(0)
onMounted(() => {
  width.value = root.value?.clientWidth ?? 0
})
useResizeObserver(root, ([entry]) => {
  width.value = Math.round(entry?.contentRect.width ?? 0)
})
const ready = computed(() => width.value > 0)

const colWidth = computed(() => {
  if (width.value < 768) return Math.max(100, width.value / 3.5)
  if (width.value < 1024) return Math.max(110, width.value / 5)
  return Math.max(120, width.value / 7)
})

const startOfDay = (value: string | Date) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

const today = startOfDay(new Date())
const rangeStart = new Date(today.getTime() - DAYS_EACH_SIDE * DAY_MS)
const todayIndex = DAYS_EACH_SIDE

const dayIndex = (date: Date) => Math.round((date.getTime() - rangeStart.getTime()) / DAY_MS)
const labelFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' })
const dayLabel = (index: number) => labelFormat.format(new Date(rangeStart.getTime() + index * DAY_MS))

const days = Array.from({ length: DAYS_EACH_SIDE * 2 + 1 }, (_, index) => index)
const { list: visibleDays, containerProps, wrapperProps, scrollTo } = useVirtualList(days, { itemWidth: () => colWidth.value, overscan: 5 })

// Earliest start first; each project goes in the first lane that is free by then
const bars = computed(() => {
  const laneEnds: number[] = []

  return props.projects
    .map((project) => {
      const from = dayIndex(startOfDay(project.period.start))
      return { project, from, to: Math.max(from, dayIndex(startOfDay(project.period.end))) }
    })
    .sort((a, b) => a.from - b.from)
    .map(({ project, from, to }) => {
      let lane = laneEnds.findIndex((laneEnd) => laneEnd < from)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = to

      return {
        id: project.id,
        title: project.title,
        lane,
        from,
        to,
        style: {
          left: `${from * colWidth.value + 4}px`,
          width: `${(to - from + 1) * colWidth.value - 8}px`,
          top: `${HEADER_HEIGHT + lane * LANE_HEIGHT}px`,
        },
      }
    })
})

// Only bars that touch the rendered day window are mounted
const visibleBars = computed(() => {
  const first = visibleDays.value[0]?.index ?? 0
  const last = visibleDays.value.at(-1)?.index ?? 0
  return bars.value.filter(({ from, to }) => to >= first && from <= last)
})

const contentHeight = computed(() => HEADER_HEIGHT + Math.max(bars.value.length ? Math.max(...bars.value.map(({ lane }) => lane)) + 1 : 0, 3) * LANE_HEIGHT + 16)

// Open on today, two columns in. This runs before the first paint, so the timeline never visibly jumps
watch(
  ready,
  async (isReady) => {
    if (!isReady) return
    await nextTick()
    scrollTo(todayIndex - 2)
  },
  { immediate: true }
)

// Resizing changes the column width; keep the same day at the left edge instead of drifting
watch(
  colWidth,
  (next, previous) => {
    if (scroller.value && previous) scroller.value.scrollLeft = (scroller.value.scrollLeft / previous) * next
  },
  { flush: 'post' }
)

// A mouse wheel only moves vertically, so use it to scroll along the days unless the lanes themselves overflow
function onWheel(event: WheelEvent) {
  const element = scroller.value
  if (!element || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || element.scrollHeight > element.clientHeight) return

  event.preventDefault()
  element.scrollLeft += event.deltaY
}
</script>

<template>
  <section ref="root" aria-label="Project timeline" class="relative h-60 overflow-hidden rounded-lg bg-dark-500">
    <div v-if="ready" v-bind="containerProps" class="scrollbar-hidden size-full overflow-auto overscroll-x-contain" @wheel="onWheel">
      <div class="relative" :style="{ width: `${days.length * colWidth}px`, height: `${contentHeight}px`, minHeight: '100%' }">
        <!-- Day lines, one repeating background instead of an element per day -->
        <div
          class="absolute inset-x-0 bottom-0"
          :style="{
            top: `${HEADER_HEIGHT - 4}px`,
            backgroundImage: 'linear-gradient(to right, transparent calc(50% - 1px), #fff calc(50% - 1px), #fff calc(50% + 1px), transparent calc(50% + 1px))',
            backgroundSize: `${colWidth}px 100%`,
          }" />
        <div class="absolute bottom-0 w-1 bg-accent-500" :style="{ left: `${(todayIndex + 0.5) * colWidth - 2}px`, top: `${HEADER_HEIGHT - 4}px` }" />

        <!-- Date labels stay pinned to the top while the lanes scroll vertically -->
        <div class="sticky top-0 z-20 bg-dark-500" :style="{ height: `${HEADER_HEIGHT - 4}px` }">
          <div v-bind="wrapperProps">
            <div
              v-for="{ index } in visibleDays"
              :key="index"
              class="shrink-0 pt-3 text-center text-xs md:text-sm"
              :class="index === todayIndex ? 'font-semi-bold text-white' : 'text-light-500'"
              :style="{ width: `${colWidth}px` }">
              {{ dayLabel(index) }}
            </div>
          </div>
        </div>

        <NuxtLink
          v-for="bar in visibleBars"
          :key="bar.id"
          :to="`/project/${bar.id}`"
          :style="bar.style"
          class="absolute z-10 flex h-7 items-center truncate rounded-l-sm rounded-r-full border-l-4 border-info-500 bg-dark-600 px-3 text-xs shadow-sm transition-colors hover:bg-dark-400 md:text-sm">
          <span class="truncate text-white">{{ bar.title }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
