<script setup lang="ts">
import { useDropZone, useIntervalFn } from '@vueuse/core'

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

function onFilesDropped(files: File[] | null) {
  if (!files?.length) return
  const newDeclarations = files.map((f) => ({
    file: f,
    status: 'idle' as const,
    progress: 0,
  }))
  fileQueue.value.push(...newDeclarations)
}

useDropZone(dropZoneRef, { onDrop: onFilesDropped })

const { pause: stopPolling, resume: startPolling } = useIntervalFn(
  async () => {
    if (!activeBatchId.value) return
    try {
      const res = await $fetch(`/api/drive/${props.projectId}/media/uploads/${activeBatchId.value}`)
      const remoteUploads = res.uploads || res.data?.uploads || []

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
    const remoteUploads = initRes.uploads

    // Map by index to guarantee exact alignment regardless of filename mutations
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
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="backdrop-blur-xs fixed inset-0 z-50 flex select-none items-center justify-center bg-black/80 p-4" @click.self="isOpen = false">
        <div class="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-dark-400 font-main text-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <span class="font-semibold text-sm tracking-wide">Import assets or connect cloud vault</span>
            <button class="text-light-500 transition-colors hover:text-white" @click="isOpen = false">
              <NuxtIcon name="local:cross" class="text-lg" />
            </button>
          </div>

          <div class="flex flex-col gap-6 p-6">
            <div
              ref="dropZone"
              class="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-dark-500/40 p-12 text-center transition-colors hover:border-primary-400 hover:bg-dark-500/60">
              <NuxtIcon name="local:photo" class="mb-3 text-3xl text-light-500" />
              <p class="font-semibold text-sm text-white">Drop anywhere to import</p>
              <p class="mt-1 text-xs text-light-500">
                Or select <label class="cursor-pointer text-primary-400 underline hover:text-primary-500">files<input type="file" multiple class="hidden" @change="handleFileInput" /></label>
              </p>
            </div>

            <div v-if="fileQueue.length" class="flex max-h-60 flex-col gap-2 overflow-y-auto border-t border-white/10 pt-4">
              <div v-for="item in fileQueue" :key="item.file.name" class="flex items-center justify-between rounded-lg bg-dark-500/50 px-4 py-2.5 text-base">
                <div class="flex items-center gap-3 truncate pr-4">
                  <NuxtIcon name="local:file-document" class="text-base text-light-500" />
                  <span class="truncate">{{ item.file.name }}</span>
                </div>

                <div class="flex shrink-0 items-center gap-3">
                  <span
                    class="text-sm uppercase"
                    :class="{
                      'animate-pulse text-warning-500': item.status === 'uploading' || item.status === 'processing',
                      'text-success-400': item.status === 'completed',
                      'text-alert-400': item.status === 'failed',
                      'text-light-500': item.status === 'idle',
                    }"
                    >{{ item.status }} <span v-if="item.status !== 'idle' && item.status !== 'failed'">({{ item.progress }}%)</span></span
                  >
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <div />
              <div class="flex items-center gap-3">
                <button class="px-4 py-2 text-xs text-light-500 hover:text-white" @click="fileQueue = []">Clear</button>
                <button
                  :disabled="!fileQueue.length || isInitializing"
                  class="font-semibold rounded-xl bg-primary-500 px-5 py-2.5 text-xs text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  @click="executeDispatch">
                  {{ isInitializing ? 'Allocating Keys...' : `Dispatch (${fileQueue.length})` }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
