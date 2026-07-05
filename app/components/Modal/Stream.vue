<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  isOpen: boolean
  videoInputs: MediaDeviceInfo[]
  audioInputs: MediaDeviceInfo[]
  activeVideoInputId?: string
  activeAudioInputId?: string
}>()

const emit = defineEmits<{
  close: []
  create: [deviceId: string]
  update: [input: 'video' | 'audio', id: string]
}>()

const deviceId = ref('')

// Auto-generate a device name slug based on the active camera label
watchEffect(() => {
  if (props.isOpen && props.videoInputs.length) {
    const activeDevice = props.videoInputs.find((d) => d.deviceId === props.activeVideoInputId) || props.videoInputs[0]
    if (activeDevice?.label) {
      const cleanName = activeDevice.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      deviceId.value = cleanName || `camera-${Math.floor(Math.random() * 1000)}`
    } else {
      deviceId.value = `camera-${Math.floor(Math.random() * 1000)}`
    }
  } else if (!props.isOpen) {
    deviceId.value = ''
  }
})

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
  <ModalBase :is-open="isOpen" inner-class="w-full max-w-sm rounded-2xl border border-dark-600 bg-dark-400 shadow-2xl overflow-hidden" @close="onClose">
    <div class="flex select-none flex-col font-main text-white">
      <!-- Header: 24px Padding -->
      <div class="flex flex-col gap-1 border-b border-dark-600 px-6 py-4">
        <h2 class="text-lg font-bold text-white">Start Stream</h2>
        <p class="text-xs font-regular text-light-500">Configure your camera and microphone sources.</p>
      </div>

      <div class="flex flex-col gap-6 px-6 py-6">
        <!-- Input -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-semi-bold text-light-500">Source Name</label>
          <div class="flex items-center gap-2 rounded-xl border border-dark-600 bg-dark-500 px-4 py-3 transition-colors focus-within:border-primary-500">
            <NuxtIcon name="local:camera" class="shrink-0 text-base text-light-500" />
            <input
              v-model="deviceId"
              type="text"
              placeholder="e.g. front-camera"
              class="w-full bg-transparent text-sm font-regular text-white outline-none placeholder:text-light-600"
              @keydown.enter="confirm" />
          </div>
        </div>

        <!-- Devices -->
        <div class="flex flex-col gap-6">
          <!-- Video -->
          <div class="flex flex-col gap-2">
            <h3 class="mb-1 text-[10px] font-bold uppercase tracking-widest text-light-500">Video Source</h3>
            <button
              v-for="videoInput of videoInputs"
              :key="videoInput.deviceId"
              type="button"
              class="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left text-sm font-regular transition-colors hover:bg-dark-500"
              :class="activeVideoInputId === videoInput.deviceId ? 'border-dark-600 bg-dark-500 font-semi-bold text-white' : 'text-light-600'"
              @click="emit('update', 'video', videoInput.deviceId)">
              <span class="truncate">{{ videoInput.label || 'Unknown Camera' }}</span>
              <span v-if="activeVideoInputId === videoInput.deviceId" class="text-xs text-primary-500">✓</span>
            </button>
          </div>

          <!-- Audio -->
          <div class="flex flex-col gap-2">
            <h3 class="mb-1 text-[10px] font-bold uppercase tracking-widest text-light-500">Audio Source</h3>
            <button
              v-for="audioInput of audioInputs"
              :key="audioInput.deviceId"
              type="button"
              class="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left text-sm font-regular transition-colors hover:bg-dark-500"
              :class="activeAudioInputId === audioInput.deviceId ? 'border-dark-600 bg-dark-500 font-semi-bold text-white' : 'text-light-600'"
              @click="emit('update', 'audio', audioInput.deviceId)">
              <span class="truncate">{{ audioInput.label || 'Unknown Microphone' }}</span>
              <span v-if="activeAudioInputId === audioInput.deviceId" class="text-xs text-primary-500">✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Action -->
      <div class="rounded-b-2xl border-t border-dark-600 bg-dark-500 px-6 py-4">
        <button
          type="button"
          :disabled="!deviceId.trim()"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-lg transition-transform hover:bg-light-600 active:scale-95 disabled:opacity-40 disabled:hover:bg-white"
          @click="confirm">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-black opacity-75" />
            <span class="relative inline-flex size-2 rounded-full bg-black" />
          </span>
          Go Live
        </button>
      </div>
    </div>
  </ModalBase>
</template>
