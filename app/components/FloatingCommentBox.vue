<script setup lang="ts">
const props = defineProps<{
  x: number
  y: number
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  submit: [text: string]
}>()

const text = ref('')

function onSubmit() {
  if (!text.value.trim() || props.isSubmitting) return
  emit('submit', text.value)
}
</script>

<template>
  <div class="pointer-events-auto absolute z-40 flex items-center gap-2" :style="{ left: `${x}%`, top: `${y}%` }" @click.stop>
    <div class="size-6 shrink-0 rounded-bl-none rounded-br-full rounded-tl-full rounded-tr-full bg-primary-500 shadow-2xl" />

    <!-- Dark Floating Pill Input -->
    <form class="flex w-72 items-center gap-2 rounded-full border border-white/15 bg-dark-500/95 p-1.5 pl-4 shadow-2xl backdrop-blur-xl" @submit.prevent="onSubmit">
      <input v-model="text" autofocus type="text" placeholder="Add a comment" class="w-full bg-transparent pr-2 font-main text-xs text-white outline-none placeholder:text-light-500" />

      <button
        type="submit"
        :disabled="!text.trim() || isSubmitting"
        class="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-semi-bold text-white transition-all hover:bg-white hover:text-black disabled:opacity-30">
        ↑
      </button>
    </form>
  </div>
</template>
