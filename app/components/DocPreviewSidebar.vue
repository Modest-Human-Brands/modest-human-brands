<script setup lang="ts">
export interface DocumentDetail {
  id: string
  name: string
  sizeBytes: number
  extension: string
  uploadedBy?: { name: string; avatar?: string }
  uploadedAt: string
  project?: string
  source?: string
  previewUrl?: string
  openedAt?: string
  filePath?: string
  status?: string
}

interface Props {
  document: DocumentDetail | null
  projectId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'voided', data: { documentStatus: string; fileName: string }): void
  (e: 'comment'): void
}>()

const route = useRoute()
const effectiveProjectId = computed(() => props.projectId || (route.params.projectId as string) || props.document?.project || '')

interface SidebarAction {
  id: 'comment' | 'sign' | 'edit' | 'download' | 'print' | 'void'
  label: string
  icon: string
}

const sidebarActions: readonly SidebarAction[] = [
  { id: 'comment', label: 'Add comments', icon: 'local:message' },
  { id: 'sign', label: 'Fill & Sign', icon: 'local:signature' },
  { id: 'edit', label: 'Edit PDF', icon: 'local:pen' },
  { id: 'download', label: 'Download PDF', icon: 'local:download' },
  { id: 'print', label: 'Print PDF', icon: 'local:print' },
  { id: 'void', label: 'Void', icon: 'material-symbols:cancel' },
] as const

// --- Action Handlers ---

function handleComment() {
  emit('comment')
}

async function handleDownload() {
  if (!props.document?.previewUrl) return

  const downloadUrl = `${props.document.previewUrl}?download=true`

  try {
    const response = await fetch(downloadUrl)
    if (!response.ok) throw new Error('Network response was not ok')

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = blobUrl
    a.download = props.document.name

    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Download failed:', error)
  }
}

async function handlePrint() {
  const src = props.document?.previewUrl
  if (!src) return
  let blobUrl: string | null = null

  try {
    const response = await fetch(src)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)

    const blob = await response.blob()
    blobUrl = URL.createObjectURL(blob)

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    iframe.src = blobUrl

    document.body.appendChild(iframe)

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => {
          iframe.remove()
          if (blobUrl) URL.revokeObjectURL(blobUrl)
        }, 1000)
      }
    }
  } catch (error) {
    console.error('Print failed:', error)
    if (blobUrl) URL.revokeObjectURL(blobUrl)
  }
}

// --- Void Logic ---

const isVoidModalOpen = ref(false)
const voidReason = ref('')
const isVoiding = ref(false)
const voidError = ref<string | null>(null)

function openVoidModal() {
  if (!props.document) return
  voidReason.value = ''
  voidError.value = null
  isVoidModalOpen.value = true
}

function closeVoidModal() {
  if (isVoiding.value) return
  isVoidModalOpen.value = false
  voidReason.value = ''
  voidError.value = null
}

async function confirmVoid() {
  const reason = voidReason.value.trim()
  if (reason.length < 5) {
    voidError.value = 'Reason must be at least 5 characters.'
    return
  }

  if (!props.document?.id || !effectiveProjectId.value) {
    voidError.value = 'Document or Project ID is missing.'
    return
  }

  isVoiding.value = true
  voidError.value = null

  try {
    const response = await $fetch<{ documentStatus: string; fileName: string }>(`/api/doc/${effectiveProjectId.value}/${props.document.id}/void`, {
      method: 'POST',
      body: { reason },
    })

    emit('voided', response)
    closeVoidModal()
  } catch (err) {
    voidError.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Failed to void document.'
  } finally {
    isVoiding.value = false
  }
}

// Action dispatcher
function onActionClick(actionId: SidebarAction['id']) {
  switch (actionId) {
    case 'comment':
      handleComment()
      break
    case 'download':
      handleDownload()
      break
    case 'print':
      handlePrint()
      break
    case 'void':
      openVoidModal()
      break
    case 'sign':
    case 'edit':
      if (props.document?.id && effectiveProjectId.value) {
        navigateTo(`/doc/${effectiveProjectId.value}/${props.document.id}`)
      }
      break
  }
}
</script>

<template>
  <AppSidebar class="hidden md:block">
    <div class="flex h-full flex-col p-4 md:p-2">
      <div v-if="!document" class="flex h-full flex-col items-center justify-center pb-10 text-white/40 md:pb-0">
        <NuxtIcon name="local:document" class="mb-4 text-4xl opacity-50" />
        <p class="font-semibold text-sm">Select a document to preview</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div class="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-md border border-white/10 bg-dark-500">
          <NuxtImg v-if="document.previewUrl" :provider="undefined" :src="`${document.previewUrl}?type=image`" :alt="document.name" class="size-full object-cover" />
          <NuxtIcon v-else name="local:file-pdf" class="text-7xl text-light-500/40" />
        </div>

        <div class="flex flex-col gap-1">
          <h2 class="font-semibold truncate text-base text-white" :title="document.name">{{ document.name }}</h2>
          <p class="text-xs text-light-500">
            <span class="uppercase">{{ document.extension }}</span> • Opened {{ document.openedAt || document.uploadedAt }}
          </p>
          <p class="truncate text-sm text-light-500/70" :title="document.filePath || document.source">
            {{ document.filePath || document.source || 'Cloud Workspace' }}
          </p>
        </div>

        <nav class="mt-2 flex flex-col gap-1 border-t border-white/5 py-4">
          <button
            v-for="action in sidebarActions"
            :key="action.id"
            type="button"
            :class="[
              'font-medium group flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
              action.id === 'void' ? 'text-red-400/90 hover:bg-red-500/10 hover:text-red-300' : 'text-light-400 hover:bg-white/5 hover:text-white',
            ]"
            @click="onActionClick(action.id)">
            <NuxtIcon :name="action.icon" :class="['text-lg transition-colors', action.id === 'void' ? 'text-red-400 group-hover:text-red-300' : 'text-light-500 group-hover:text-accent-400']" />
            <span class="truncate">{{ action.label }}</span>
          </button>
        </nav>
      </div>
    </div>
  </AppSidebar>

  <!-- Void Confirmation Modal -->
  <Teleport to="body">
    <div v-if="isVoidModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" @click.self="closeVoidModal">
      <div class="w-full max-w-md rounded-xl border border-white/10 bg-dark-400 p-6 shadow-2xl">
        <div class="mb-4 flex items-center gap-3">
          <div class="bg-red-500/10 text-red-400 flex size-10 items-center justify-center rounded-full">
            <NuxtIcon name="material-symbols:cancel" class="text-2xl" />
          </div>
          <div>
            <h3 class="font-semibold text-base text-white">Void Document</h3>
            <p class="text-xs text-light-500">This action stamps "VOID" on the PDF and cancels all signers.</p>
          </div>
        </div>

        <div class="mb-4">
          <label class="font-medium mb-1.5 block text-xs text-light-400"> Reason for voiding <span class="text-red-400">*</span> </label>
          <textarea
            v-model="voidReason"
            rows="3"
            placeholder="Please enter a reason (min 5 characters)..."
            class="w-full resize-none rounded-lg border border-white/10 bg-dark-500 p-2.5 text-sm text-white placeholder-light-600 focus:border-accent-500 focus:outline-none"
            :disabled="isVoiding" />
          <p v-if="voidError" class="text-red-400 mt-1.5 text-xs">
            {{ voidError }}
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" class="font-medium rounded-lg border border-white/10 px-4 py-2 text-sm text-light-400 hover:bg-white/5 hover:text-white" :disabled="isVoiding" @click="closeVoidModal">
            Cancel
          </button>
          <button
            type="button"
            class="bg-red-600 font-medium hover:bg-red-500 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition disabled:opacity-50"
            :disabled="isVoiding || voidReason.trim().length < 5"
            @click="confirmVoid">
            <span v-if="isVoiding">Voiding...</span>
            <span v-else>Confirm Void</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
