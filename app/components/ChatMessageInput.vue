<script setup lang="ts">
const props = defineProps<{ isActionsOpen?: boolean }>()
const text = ref('')
const emit = defineEmits<{ (e: 'send', payload: string): void; (e: 'open-actions'): void }>()

function handleInput() {
  if (text.value.trim() || props.isActionsOpen) {
    emit('send', text.value)
    if (!props.isActionsOpen) text.value = ''
  }
}
</script>

<template>
  <div class="relative z-10 flex w-full items-center gap-2 p-2 md:gap-4 md:p-4">
    <div class="flex h-12 flex-1 items-center gap-2 rounded-full bg-dark-500 px-5 transition-colors focus-within:bg-dark-600">
      <button class="flex items-center justify-center text-light-500 transition-colors hover:text-white" @click="emit('open-actions')">
        <NuxtIcon :name="isActionsOpen ? 'local:cross' : 'local:plus'" class="text-xl" />
      </button>
      <input
        v-model="text"
        type="text"
        :placeholder="isActionsOpen ? 'Select or configure a template...' : 'Type a message...'"
        class="h-full flex-1 bg-transparent text-sm text-white outline-none placeholder:text-light-500"
        @keyup.enter="handleInput" />
    </div>
    <button class="flex size-12 shrink-0 items-center justify-center rounded-full bg-dark-500 text-white transition-colors hover:bg-dark-600" @click="handleInput">
      <NuxtIcon name="local:send" class="text-xl" />
    </button>
  </div>
</template>
