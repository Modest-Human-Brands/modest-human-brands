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
  <ModalBase :is-open="isOpen" inner-class="max-w-sm rounded-lg border border-white/10 bg-[#191919] shadow-2xl" @close="onClose">
    <div class="flex flex-col gap-6 p-6 font-main text-[#D4D4D2]">
      <!-- Header -->
      <div class="flex flex-col gap-1 border-b border-white/10 pb-4">
        <h2 class="font-semibold text-base text-white">Start Stream</h2>
        <p class="text-xs text-[#9B9A97]">Configure your camera and microphone sources.</p>
      </div>

      <!-- Input -->
      <div class="flex flex-col gap-2">
        <label class="font-medium text-xs text-[#9B9A97]">Source Name</label>
        <div class="flex items-center gap-2 rounded border border-white/10 bg-black/20 px-3 py-2 transition-colors focus-within:border-white/30">
          <NuxtIcon name="local:camera" class="shrink-0 text-[14px] text-[#9B9A97]" />
          <input v-model="deviceId" type="text" placeholder="e.g. front-camera" class="w-full bg-transparent text-sm text-[#D4D4D2] outline-none placeholder:text-white/20" @keydown.enter="confirm" />
        </div>
      </div>

      <!-- Devices -->
      <div class="flex flex-col gap-5">
        <!-- Video -->
        <div class="flex flex-col gap-1">
          <h3 class="font-semibold mb-1 text-[11px] uppercase tracking-wider text-[#9B9A97]">Video Source</h3>
          <button
            v-for="videoInput of videoInputs"
            :key="videoInput.deviceId"
            type="button"
            class="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
            :class="{ 'font-medium bg-white/5 text-white': activeVideoInputId === videoInput.deviceId }"
            @click="emit('update', 'video', videoInput.deviceId)">
            <span class="truncate">{{ videoInput.label || 'Unknown Camera' }}</span>
            <span v-if="activeVideoInputId === videoInput.deviceId" class="text-xs text-white">✓</span>
          </button>
        </div>

        <!-- Audio -->
        <div class="flex flex-col gap-1">
          <h3 class="font-semibold mb-1 text-[11px] uppercase tracking-wider text-[#9B9A97]">Audio Source</h3>
          <button
            v-for="audioInput of audioInputs"
            :key="audioInput.deviceId"
            type="button"
            class="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
            :class="{ 'font-medium bg-white/5 text-white': activeAudioInputId === audioInput.deviceId }"
            @click="emit('update', 'audio', audioInput.deviceId)">
            <span class="truncate">{{ audioInput.label || 'Unknown Microphone' }}</span>
            <span v-if="activeAudioInputId === audioInput.deviceId" class="text-xs text-white">✓</span>
          </button>
        </div>
      </div>

      <!-- Action -->
      <div class="mt-2 border-t border-white/10 pt-4">
        <button
          type="button"
          :disabled="!deviceId.trim()"
          class="font-medium hover:bg-gray-200 flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-sm text-black transition-colors disabled:opacity-40"
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
