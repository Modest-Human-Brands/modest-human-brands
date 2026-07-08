<script setup lang="ts">
import { useDropZone, useIntervalFn } from '@vueuse/core'
import { ref } from 'vue'

const props = defineProps<{
  projectId: string
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

interface DeclaredFile {
  file: File
  uploadId?: string
  uploadUrl?: string
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
}

const dropZoneRef = useTemplateRef<HTMLElement>('dropZone')
const fileQueue = ref<DeclaredFile[]>([])
const activeBatchId = ref<string | null>(null)
const isInitializing = ref(false)

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function onFilesDropped(files: File[] | null) {
  if (!files?.length) return
  const newDeclarations = files.map((f) => ({
    file: f,
    status: 'idle' as const,
    progress: 0,
    size: f.size,
  }))
  fileQueue.value.push(...newDeclarations)
}

useDropZone(dropZoneRef, { onDrop: onFilesDropped })

const { pause: stopPolling, resume: startPolling } = useIntervalFn(
  async () => {
    if (!activeBatchId.value) return
    try {
      const res = await $fetch(`/api/drive/${props.projectId}/media/uploads/${activeBatchId.value}`)
      const remoteUploads = res.uploads || []

      let allDone = true
      for (const remote of remoteUploads) {
        const local = fileQueue.value.find((f) => f.uploadId === remote.uploadId)
        if (local) {
          local.status = remote.status
          local.progress = remote.progressPercent
          if (remote.error) local.error = remote.error.message
        }
        if (remote.status !== 'completed' && remote.status !== 'failed') allDone = false
      }

      if (allDone) {
        stopPolling()
        emit('refresh')
      }
    } catch (err) {
      console.error('[UploadStudio Polling Error]:', err)
    }
  },
  1500,
  { immediate: false }
)

async function executeDispatch() {
  if (!fileQueue.value.length || isInitializing.value) return
  isInitializing.value = true

  try {
    const { user } = useUserSession()

    const pendingFiles = fileQueue.value.filter((f) => f.status === 'idle')
    if (!pendingFiles.length) return

    const payload = {
      orgId: user.value?.organizations[0],
      projectId: props.projectId,
      files: pendingFiles.map((item) => ({
        filename: item.file.name,
        mimeType: item.file.type || 'application/octet-stream',
        sizeBytes: item.file.size,
      })),
    }

    const initRes = await $fetch(`/api/drive/${props.projectId}/media/uploads`, { method: 'POST', body: payload })

    activeBatchId.value = initRes.batchId
    const remoteUploads = initRes.uploads || []

    pendingFiles.forEach((local, index) => {
      const remote = remoteUploads[index]
      if (remote) {
        local.uploadId = remote.uploadId
        local.uploadUrl = remote.uploadUrl
      }
    })

    startPolling()

    await Promise.all(
      pendingFiles.map(async (item) => {
        if (!item.uploadUrl) return
        item.status = 'uploading'
        try {
          await fetch(item.uploadUrl, {
            method: 'PUT',
            body: item.file,
            headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
          })
          item.status = 'processing'
        } catch {
          item.status = 'failed'
          item.error = 'Network pipe broken during transmission'
        }
      })
    )
  } catch (err) {
    console.error('[UploadStudio Dispatch Error]:', err)
  } finally {
    isInitializing.value = false
  }
}

function handleFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) onFilesDropped(Array.from(target.files))
}
</script>

<template>
  <ModalBase :is-open="isOpen" inner-class="w-full max-w-2xl rounded-2xl border border-dark-600 bg-dark-400 shadow-2xl overflow-hidden" @close="isOpen = false">
    <div class="flex select-none flex-col font-main">
      <div class="flex flex-col gap-6 p-6">
        <!-- Dynamic Dropzone -->
        <div
          ref="dropZone"
          class="relative flex items-center justify-center rounded-2xl border border-dashed transition-all duration-300"
          :class="[fileQueue.length ? 'flex-row border-dark-600 bg-dark-500 p-6 hover:border-light-500' : 'flex-col border-light-600 bg-dark-400 p-16 hover:border-primary-500 hover:bg-dark-500']">
          <div class="flex items-center gap-4" :class="{ 'flex-col text-center': !fileQueue.length }">
            <NuxtIcon name="local:upload" :class="fileQueue.length ? 'text-2xl text-light-500' : 'mb-2 text-4xl text-white'" />
            <div>
              <p class="text-sm font-bold text-white">
                {{ fileQueue.length ? 'Drop additional files here' : 'Drag & drop files to upload' }}
              </p>
              <p class="mt-1 text-xs font-regular text-light-500">
                or
                <label class="cursor-pointer text-white underline decoration-light-500 transition-colors hover:text-primary-500 hover:decoration-primary-500"
                  >browse<input type="file" multiple class="hidden" @change="handleFileInput"
                /></label>
              </p>
            </div>
          </div>
        </div>

        <!-- Futuristic Queue List -->
        <div v-if="fileQueue.length" class="scrollbar-hidden flex max-h-[40vh] flex-col gap-2 overflow-y-auto pr-2">
          <div v-for="item in fileQueue" :key="item.file.name" class="relative overflow-hidden rounded-xl border border-dark-600 bg-dark-500 p-4 transition-colors hover:border-light-500">
            <!-- Embedded Background Progress Bar -->
            <div class="absolute inset-0 z-0 bg-primary-600/10 transition-all duration-300 ease-out" :style="{ width: `${item.progress}%` }" />

            <!-- Content -->
            <div class="relative z-10 flex items-center justify-between gap-4">
              <div class="flex min-w-0 flex-1 items-center gap-4">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dark-600 bg-dark-400">
                  <NuxtIcon name="local:file-document" class="text-xl text-white" />
                </div>
                <div class="flex min-w-0 flex-col gap-1">
                  <span class="truncate text-sm font-semi-bold text-white">{{ item.file.name }}</span>
                  <span class="text-xs font-regular text-light-500">{{ formatSize(item.file.size) }}</span>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-1">
                <span
                  class="text-[10px] font-bold uppercase tracking-widest"
                  :class="{
                    'animate-pulse text-warning-500': item.status === 'uploading' || item.status === 'processing',
                    'text-success-500': item.status === 'completed',
                    'text-alert-500': item.status === 'failed',
                    'text-light-500': item.status === 'idle',
                  }">
                  {{ item.status }}
                </span>
                <span v-if="item.status !== 'idle' && item.status !== 'failed'" class="font-main text-xs font-regular text-light-400"> {{ item.progress }}% </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between border-t border-dark-600 bg-dark-500 px-6 py-4">
        <div class="text-xs font-semi-bold text-light-500">{{ fileQueue.length }} file(s) queued</div>
        <div class="flex items-center gap-4">
          <button class="text-xs font-semi-bold text-light-500 transition-colors hover:text-white" @click="fileQueue = []">Clear All</button>
          <button
            :disabled="!fileQueue.length || isInitializing"
            class="flex items-center gap-2 rounded-xl bg-white px-6 py-2 text-sm font-bold text-black shadow-lg transition-transform hover:bg-light-600 active:scale-95 disabled:opacity-50 disabled:hover:bg-white"
            @click="executeDispatch">
            <span v-if="isInitializing" class="relative flex size-2"
              ><span class="absolute inline-flex size-full animate-ping rounded-full bg-black opacity-75" /><span class="relative inline-flex size-2 rounded-full bg-black"
            /></span>
            {{ isInitializing ? 'Initializing...' : 'Dispatch' }}
          </button>
        </div>
      </div>
    </div>
  </ModalBase>
</template>
