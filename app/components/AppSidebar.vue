<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    open?: boolean
    asDrawerOnMobile?: boolean
    peekHeight?: number
  }>(),
  {
    open: true,
    asDrawerOnMobile: false,
    peekHeight: 6,
  }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const isMounted = ref(false)
onMounted(() => (isMounted.value = true))

const { width } = useWindowSize()

const isDesktop = computed(() => isMounted.value && width.value >= 768)

const isOpen = computed({
  get: () => (isDesktop.value ? true : props.open),
  set: (val) => emit('update:open', val),
})

const asideRef = useTemplateRef<HTMLElement>('asideRef')
const { height: asideHeight } = useElementSize(asideRef)

const closedOffset = computed(() => 100 - props.peekHeight)
const dragOffset = ref(0)
const suppressClick = ref(false)

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

const { isSwiping, posStart, posEnd } = usePointerSwipe(asideRef, {
  disableTextSelect: true,
  onSwipeStart() {
    if (isDesktop.value || !props.asDrawerOnMobile) return
    dragOffset.value = isOpen.value ? 0 : closedOffset.value
  },
  onSwipe() {
    if (isDesktop.value || !props.asDrawerOnMobile || !asideHeight.value) return
    const draggedDownPx = posEnd.y - posStart.y
    const base = isOpen.value ? 0 : closedOffset.value
    dragOffset.value = clamp(base + (draggedDownPx / asideHeight.value) * 100, 0, closedOffset.value)
  },
  onSwipeEnd() {
    if (isDesktop.value || !props.asDrawerOnMobile) return
    if (Math.abs(posEnd.y - posStart.y) > 5) {
      suppressClick.value = true
      setTimeout(() => (suppressClick.value = false), 0)
    }
    isOpen.value = dragOffset.value < closedOffset.value / 2
    dragOffset.value = 0
  },
})

const drawerStyle = computed(() => {
  if (!props.asDrawerOnMobile || isDesktop.value) return {}
  const offset = isSwiping.value ? dragOffset.value : isOpen.value ? 0 : closedOffset.value
  return {
    transform: `translateY(${offset}%)`,
    transition: isSwiping.value ? 'none' : undefined,
  }
})

function onHandleKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div
    v-if="asDrawerOnMobile"
    class="absolute inset-0 bg-black backdrop-blur-sm transition-opacity duration-300 md:hidden"
    :class="isOpen ? 'pointer-events-auto' : 'pointer-events-none'"
    :style="!isMounted ? { display: 'none' } : { opacity: isOpen ? 0.6 : 0 }"
    @click="isOpen = false" />

  <aside
    v-show="isDesktop || isOpen || asDrawerOnMobile"
    ref="asideRef"
    v-bind="$attrs"
    :class="[
      'flex shrink-0 flex-col bg-dark-400 transition-transform duration-300 md:!flex md:!translate-y-0',
      asDrawerOnMobile
        ? 'absolute inset-x-0 bottom-0 z-50 max-h-[70dvh] w-full rounded-t-3xl border-t border-white/5 md:relative md:h-full md:max-h-full md:w-[400px] md:translate-y-0 md:rounded-none md:border-l md:border-t-0'
        : 'size-full md:w-[400px] md:border-l md:border-white/5',
      $attrs.class,
    ]"
    :style="drawerStyle">
    <div
      v-if="asDrawerOnMobile"
      class="flex w-full shrink-0 cursor-grab touch-none items-center justify-center py-4 active:cursor-grabbing md:hidden"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      @click="!suppressClick && (isOpen = !isOpen)"
      @keydown="onHandleKeydown">
      <div class="h-1.5 w-12 rounded-full bg-primary-500" />
    </div>
    <div class="scrollbar-hidden flex-1 p-2" :class="isDesktop || !asDrawerOnMobile || isOpen ? 'overflow-y-auto' : 'overflow-hidden'">
      <slot name="header" />
      <slot />
    </div>
  </aside>
</template>
