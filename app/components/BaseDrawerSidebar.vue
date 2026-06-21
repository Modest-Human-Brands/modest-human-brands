<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    peekHeight?: number
    desktopWidthClass?: string
  }>(),
  {
    modelValue: true,
    peekHeight: 15, // Standard height for the header area
    desktopWidthClass: 'md:w-[45%] lg:w-[40%]',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const { width: windowWidth } = useWindowSize()
const isDesktop = computed(() => windowWidth.value >= 768)

const drawerStyle = computed(() => {
  if (!isMounted.value || isDesktop.value) return {}
  return {
    transform: isOpen.value ? 'translateY(0)' : `translateY(calc(100% - ${props.peekHeight}%))`,
  }
})

const backdropOpacity = computed(() => {
  if (!isMounted.value || isDesktop.value) return 0
  return isOpen.value ? 0.6 : 0
})
</script>

<template>
  <div
    class="absolute inset-0 z-40 bg-black transition-opacity duration-300 md:hidden"
    :class="isOpen ? 'pointer-events-auto backdrop-blur-sm' : 'pointer-events-none'"
    :style="!isMounted ? { display: 'none' } : { opacity: backdropOpacity }"
    @click="isOpen = false"></div>

  <div
    class="absolute inset-x-0 bottom-0 z-50 flex max-h-[85dvh] w-full max-w-[400px] flex-col rounded-t-3xl border-t border-dark-500 bg-dark-400 transition-transform duration-300 ease-in-out md:relative md:max-h-full md:translate-y-0 md:rounded-none md:border-l md:border-t-0"
    :class="desktopWidthClass"
    :style="drawerStyle">
    <header class="flex shrink-0 items-start justify-between border-b border-dark-500 p-4 pt-6 md:p-6" :class="{ 'cursor-pointer md:cursor-auto': !isOpen }" @click="!isOpen && (isOpen = true)">
      <div class="bg-dark-300 absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full md:hidden"></div>

      <div>
        <slot name="header" />
      </div>

      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </header>

    <div class="scrollbar-hidden flex-1 overflow-y-auto p-4 md:p-6">
      <slot />
    </div>
  </div>
</template>
