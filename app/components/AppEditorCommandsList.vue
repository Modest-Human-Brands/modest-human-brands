<script setup lang="ts">
import type { Editor, Range } from '@tiptap/core'

export interface CommandItem {
  title: string
  description: string
  command: ({ editor, range }: { editor: Editor; range: Range }) => void
}

const props = defineProps<{
  items: CommandItem[]
  command: (item: CommandItem) => void
}>()

const selectedIndex = ref(0)

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  }
)

const selectItem = (index: number) => {
  const item = props.items[index]
  if (item) {
    props.command(item)
  }
}

const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
}

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

const enterHandler = () => {
  selectItem(selectedIndex.value)
}

defineExpose({
  onKeyDown: ({ event }: { event: KeyboardEvent }) => {
    if (event.key === 'ArrowUp') {
      upHandler()
      return true
    }
    if (event.key === 'ArrowDown') {
      downHandler()
      return true
    }
    if (event.key === 'Enter') {
      enterHandler()
      return true
    }
    return false
  },
})
</script>

<template>
  <div class="flex max-h-[320px] w-[260px] flex-col gap-[0.1rem] overflow-y-auto rounded-lg border border-light-600 bg-white p-[0.4rem] shadow-xl dark:border-dark-600 dark:bg-dark-500">
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="index"
        class="flex w-full cursor-pointer rounded-[0.3rem] border-0 bg-transparent px-[0.6rem] py-[0.4rem] text-left transition-colors hover:bg-light-600/40 dark:hover:bg-dark-600"
        :class="{ 'bg-light-600/40 dark:bg-dark-600': index === selectedIndex }"
        @mousedown.prevent="selectItem(index)">
        <div class="flex flex-col font-main">
          <span class="text-sm font-semi-bold text-black dark:text-white">{{ item.title }}</span>
          <span class="mt-0.5 text-xs text-light-400">{{ item.description }}</span>
        </div>
      </button>
    </template>
    <div v-else class="p-2 text-center font-main text-sm text-light-400">No results</div>
  </div>
</template>
