<script setup lang="ts" generic="T">
const props = defineProps<{
  items: T[]
  activeId: string | number
  itemKey?: keyof T | ((item: T) => string | number)
}>()

const drawerOpen = defineModel<boolean>('drawerOpen', { default: false })

const emit = defineEmits<{
  select: [item: T, id: string | number]
}>()

const listRef = ref<HTMLElement>()

function getItemId(item: T): string | number {
  if (props.itemKey) {
    if (typeof props.itemKey === 'function') return props.itemKey(item)
    return item[props.itemKey as keyof T] as unknown as string | number
  }
  return item as unknown as string | number
}

async function scrollToActive() {
  await nextTick()
  if (!listRef.value) return
  const activeEl = listRef.value.querySelector('[data-active="true"]') as HTMLElement
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
}

onMounted(scrollToActive)
watch(() => props.activeId, scrollToActive)
</script>

<template>
  <div v-if="drawerOpen" class="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden" @click="drawerOpen = false" />

  <aside
    :class="[
      drawerOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      'absolute inset-y-0 left-0 z-40 flex w-32 shrink-0 select-none flex-col border-r border-white/5 bg-dark-400/95 backdrop-blur-md transition-transform duration-300 md:relative md:translate-x-0',
    ]"
    v-bind="$attrs">
    <nav class="scrollbar-hidden flex size-full flex-col overflow-y-auto overflow-x-hidden p-3 py-4">
      <ul ref="listRef" class="flex flex-col gap-4">
        <li
          v-for="(item, index) in items"
          :key="getItemId(item)"
          :data-active="getItemId(item) === activeId"
          class="flex w-full shrink-0 cursor-pointer justify-center outline-none"
          @click="emit('select', item, getItemId(item))">
          <slot name="item" :item="item" :index="index" :is-active="getItemId(item) === activeId" />
        </li>
      </ul>
    </nav>
  </aside>
</template>
