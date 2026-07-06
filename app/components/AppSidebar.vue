<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

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
    peekHeight: 15,
  }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const isMounted = ref(false)
onMounted(() => (isMounted.value = true))

const { width } = useWindowSize()
const isDesktop = computed(() => width.value >= 768)

const isOpen = computed({
  get: () => {
    if (isMounted.value && isDesktop.value) return true
    return props.open
  },
  set: (val) => emit('update:open', val),
})

const drawerStyle = computed(() => {
  if (!props.asDrawerOnMobile || !isMounted.value || isDesktop.value) return {}
  return {
    transform: isOpen.value ? 'translateY(0)' : `translateY(calc(100% - ${props.peekHeight}%))`,
  }
})
</script>

<template>
  <div
    v-if="asDrawerOnMobile"
    class="bg-black transition-opacity duration-300"
    :class="isOpen ? 'pointer-events-auto absolute inset-0 backdrop-blur-sm md:hidden' : ''"
    :style="!isMounted ? { display: 'none' } : { opacity: isOpen ? 0.6 : 0 }"
    @click="isOpen = false" />

  <aside
    v-show="isDesktop || isOpen || asDrawerOnMobile"
    v-bind="$attrs"
    :class="[
      'scrollbar-hidden flex shrink-0 flex-col overflow-y-auto bg-dark-400 p-2 transition-all duration-300 md:!flex md:!translate-y-0',
      asDrawerOnMobile
        ? 'absolute inset-x-0 bottom-0 z-50 max-h-[70dvh] w-full rounded-t-3xl border-t border-white/5 md:relative md:h-full md:max-h-full md:w-[400px] md:translate-y-0 md:rounded-none md:border-l md:border-t-0'
        : 'size-full md:w-[400px] md:border-l md:border-white/5',
      $attrs.class,
    ]"
    :style="drawerStyle">
    <div v-if="asDrawerOnMobile" class="flex w-full shrink-0 cursor-pointer items-center justify-center pb-1 pt-3 md:hidden" @click="isOpen = !isOpen">
      <div class="h-1.5 w-12 rounded-full bg-white/20" />
    </div>

    <slot name="header" />
    <slot />
  </aside>
</template>
