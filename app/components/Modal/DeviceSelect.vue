<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [deviceId: string]
}>()

const deviceId = ref('')

function confirm() {
  const id = deviceId.value.trim()
  if (!id) return
  emit('create', id)
  emit('close')
  deviceId.value = ''
}

function onClose() {
  deviceId.value = ''
  emit('close')
}
</script>

<template>
  <ModalBase :is-open="isOpen" inner-class="max-w-sm" @close="onClose">
    <div class="flex flex-col gap-5 p-5">
      <div>
        <h2 class="text-lg font-bold">Start Stream</h2>
        <p class="mt-0.5 text-sm text-white/40">Enter a name for this camera source</p>
      </div>
      <div class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-white/20">
        <NuxtIcon name="local:camera" class="shrink-0 text-[16px] text-white/40" />
        <input
          v-model="deviceId"
          type="text"
          placeholder="e.g. front-camera, drone-cam"
          class="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          @keydown.enter="confirm" />
      </div>
      <button
        type="button"
        :disabled="!deviceId.trim()"
        class="font-semibold flex w-full items-center justify-center gap-2 rounded-xl bg-alert-500 py-3 text-sm text-white transition hover:bg-alert-400 disabled:opacity-40"
        @click="confirm">
        <span class="relative flex size-2">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
          <span class="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        Go Live
      </button>
    </div>
  </ModalBase>
</template>
