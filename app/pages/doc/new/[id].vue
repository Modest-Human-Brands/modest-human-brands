<script setup lang="ts">
import { VuePDF } from '@tato30/vue-pdf'

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const templateId = route.params.id as string

const uiStyles = {
  btnPrimary:
    'flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-dark-500 fill-dark-500 transition-colors hover:bg-light-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto',
  btnSecondary:
    'flex w-full items-center justify-center gap-2 rounded-full border border-dark-400 bg-dark-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-dark-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto',
}

interface DocumentMeta {
  id: string
  name: string
  fileName: string
  extension: string
  sizeBytes: number
  templateId: string
  previewUrl: string
  createdAt: string
  updatedAt: string
}

interface TemplateSchema {
  id: string
  variables: Record<string, unknown>
}

interface FormField {
  path: string
  label: string
  type: string
  groupName: string
}

const { data: templates } = await useFetch('/api/doc/template')

const selectedTemplate = computed(() => templates.value?.find((t: TemplateSchema) => t.id === templateId) || null)
const formData = ref<Record<string, unknown>>({})
const pdfPreviewBase64 = ref<string | null>(null)
const isPreviewLoading = ref(false)
const isGenerating = ref(false)

const isMobileDrawerOpen = ref(false)

const pdfDataUri = computed(() => (pdfPreviewBase64.value ? `data:application/pdf;base64,${pdfPreviewBase64.value}` : ''))

const { pdf, pages } = await usePdfViewer(pdfDataUri)
const viewerContainer = ref<HTMLElement>()
const { width: containerWidth, height: containerHeight } = useElementSize(viewerContainer)
const baseScale = ref(1)

const viewerState = reactive({
  page: 1,
  scale: 1,
})

watch([pdf, containerWidth, containerHeight], async () => {
  if (!pdf.value || !containerHeight.value || !containerWidth.value) return
  try {
    const docObj = await pdf.value.promise
    const pageObj = await docObj.getPage(1)
    const viewport = pageObj.getViewport({ scale: 1 })

    const scaleHeight = (containerHeight.value - 64) / viewport.height
    const scaleWidth = (containerWidth.value - 64) / viewport.width
    baseScale.value = Math.min(scaleWidth, scaleHeight)
  } catch {
    /* silent catch for rapid typing interruptions */
  }
})

const computedScale = computed(() => baseScale.value * viewerState.scale)

function setPage(p: number) {
  document.getElementById(`pdf-page-${p}`)?.scrollIntoView({ behavior: 'smooth' })
}

function onScroll(e: Event) {
  const target = e.target as HTMLElement
  if (!pages.value || pages.value <= 1) {
    viewerState.page = 1
    return
  }
  const maxScroll = target.scrollHeight - target.clientHeight
  if (maxScroll <= 0) return
  const scrollProgress = target.scrollTop / maxScroll
  const calculatedPage = Math.round(scrollProgress * (pages.value - 1)) + 1
  viewerState.page = Math.min(Math.max(1, calculatedPage), pages.value)
}

function zoomIn() {
  viewerState.scale += 0.05
}

function zoomOut() {
  if (viewerState.scale > 0.3) {
    viewerState.scale -= 0.05
  }
}

function resetZoom() {
  viewerState.scale = 1
}

function formatKeyToLabel(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const currentSchema = computed(() => {
  if (!selectedTemplate.value) return []
  const fields: FormField[] = []

  function traverse(obj: Record<string, unknown>, currentPath = '', parentName = 'General Details') {
    for (const [key, type] of Object.entries(obj)) {
      const path = currentPath ? `${currentPath}.${key}` : key

      if (typeof type === 'object' && type !== null) {
        traverse(type as Record<string, unknown>, path, formatKeyToLabel(key))
      } else {
        fields.push({
          path,
          label: formatKeyToLabel(key),
          type: String(type),
          groupName: parentName,
        })
      }
    }
  }

  traverse(selectedTemplate.value.variables)
  return fields
})

onMounted(() => {
  if (currentSchema.value.length) {
    currentSchema.value.forEach((field) => {
      if (field.type === 'array<string>') formData.value[field.path] = ['']
      else if (field.type === 'boolean') formData.value[field.path] = false
      else if (field.type === 'number') formData.value[field.path] = null
      else formData.value[field.path] = ''
    })
    triggerPreview()
  }
})

function unflattenPayload(flatData: Record<string, unknown>) {
  const result: Record<string, unknown> = {}
  for (const [path, value] of Object.entries(flatData)) {
    const keys = path.split('.')
    let current = result
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = Array.isArray(value) ? value.filter((v: unknown) => String(v).trim() !== '') : value
      } else {
        current[key] = (current[key] || {}) as Record<string, unknown>
        current = current[key] as Record<string, unknown>
      }
    })
  }
  return result
}

const triggerPreview = useDebounceFn(async () => {
  isPreviewLoading.value = true
  try {
    const nestedPayload = unflattenPayload(formData.value)
    const res = await $fetch<{ pdfBase64?: string }>('/api/doc/template/preview', {
      method: 'POST',
      body: {
        templateId: templateId,
        data: nestedPayload,
      },
    })
    if (res?.pdfBase64) {
      pdfPreviewBase64.value = res.pdfBase64
    }
  } catch (error: unknown) {
    console.error('Failed to load PDF preview:', error)
  } finally {
    isPreviewLoading.value = false
  }
}, 1200)

watch(
  formData,
  () => {
    triggerPreview()
  },
  { deep: true }
)

async function onGenerate() {
  isGenerating.value = true
  const nestedPayload = unflattenPayload(formData.value)

  try {
    const response = await $fetch<DocumentMeta>('/api/doc/template', {
      method: 'POST',
      body: {
        template: templateId,
        data: nestedPayload,
      },
    })

    if (response?.id) {
      await navigateTo(`/doc`)
    }
  } catch (error: unknown) {
    console.error('Failed to generate document:', error)
  } finally {
    isGenerating.value = false
  }
}

// --- Wizard State ---
const wizardStep = ref(0)
const totalSteps = 3 // 0: Select, 1: Fill Form, 2: Review

function nextStep() {
  if (wizardStep.value < totalSteps - 1) wizardStep.value++
}

function prevStep() {
  if (wizardStep.value > 0) {
    if (wizardStep.value === 1) {
      navigateTo('/doc')
    }
    wizardStep.value--
  }
}
</script>

<template>
  <main class="relative flex size-full flex-col overflow-hidden md:flex-row">
    <div class="relative flex h-full w-full flex-1 overflow-hidden">
      <div ref="viewerContainer" class="scrollbar-hidden relative flex h-full w-full flex-col items-center overflow-y-auto p-4 pb-32 md:p-6" @scroll="onScroll">
        <div v-if="!pdfPreviewBase64 && isPreviewLoading" class="m-auto flex flex-col items-center gap-4 text-light-500">
          <NuxtIcon name="local:loader" class="animate-spin text-4xl" />
          <span class="text-sm font-bold uppercase tracking-widest">Rendering initial preview...</span>
        </div>

        <div v-else-if="pdf && pages" class="flex w-full flex-col items-center gap-8 pb-28 transition-all duration-300" :class="{ 'opacity-40 blur-[1px]': isPreviewLoading }">
          <ClientOnly>
            <div v-for="p in pages" :id="`pdf-page-${p}`" :key="p" class="relative flex flex-col items-center shadow-2xl">
              <VuePDF :pdf="pdf" :page="p" :scale="computedScale" />
            </div>
          </ClientOnly>
        </div>
      </div>

      <div
        v-if="pdf && pages"
        class="absolute bottom-[15%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-dark-500/90 px-6 py-3 text-white shadow-2xl backdrop-blur-md md:bottom-6">
        <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="setPage(Math.max(1, viewerState.page - 1))">
          <NuxtIcon name="local:chevron-bold" class="text-lg" />
        </button>
        <span class="w-16 text-center text-xs font-bold text-light-400">{{ viewerState.page }} / {{ pages }}</span>
        <button type="button" class="shrink-0 transition-colors hover:text-primary-500" @click="setPage(Math.min(pages || 1, viewerState.page + 1))">
          <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-lg" />
        </button>

        <div class="h-4 w-px bg-white/20" />
        <button type="button" class="transition-colors hover:text-primary-500" @click="zoomIn">
          <NuxtIcon name="local:plus" class="text-lg" />
        </button>
        <button type="button" class="transition-colors hover:text-primary-500" @click="zoomOut">
          <NuxtIcon name="local:minus" class="text-lg" />
        </button>
        <button v-if="viewerState.scale !== 1" type="button" class="text-xs font-bold text-light-500 transition-colors hover:text-white" @click="resetZoom">Reset</button>
      </div>
    </div>

    <BaseDrawerSidebar v-model="isMobileDrawerOpen">
      <template #header>
        <h1 class="text-xl font-bold capitalize tracking-tight text-white">
          {{ templateId.replace(/-/g, ' ') }}
        </h1>
        <p class="mt-0.5 text-xs text-light-500">Fill details to update preview</p>
      </template>

      <template #actions>
        <NuxtLink to="/doc/new" class="hidden size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:flex">
          <NuxtIcon name="local:chevron-bold" class="text-sm" />
        </NuxtLink>
        <button
          class="flex size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:hidden"
          @click.stop="isMobileDrawerOpen = !isMobileDrawerOpen">
          <NuxtIcon name="local:chevron-bold" class="text-sm transition-transform duration-300" :class="isMobileDrawerOpen ? '-rotate-90' : 'rotate-90'" />
        </button>
      </template>

      <div v-if="wizardStep === 0 || wizardStep === 1" class="flex flex-col gap-6">
        <ConnectFormField v-for="field in currentSchema" :key="field.path" v-model="formData[field.path]" :label="field.label" :schema-type="field.type" />
      </div>

      <div v-else-if="wizardStep === 2" class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-bold text-white">Review & Generate</h2>
          <p class="text-sm text-light-500">Please review the captured information before finalizing the document.</p>
        </div>

        <div class="flex flex-col gap-0 overflow-hidden border border-dark-400 bg-dark-500/50">
          <div v-for="field in currentSchema" :key="field.path" class="flex flex-col gap-1 border-b border-dark-400 p-4 last:border-0 md:flex-row md:items-start md:justify-between">
            <span class="pt-1 text-xs font-bold uppercase tracking-wider text-light-500 md:w-1/3">
              {{ field.groupName === 'General Details' ? field.label : `${field.groupName} → ${field.label}` }}
            </span>

            <span v-if="field.type === 'boolean'" class="font-semibold text-sm md:w-2/3 md:text-right" :class="formData[field.path] ? 'text-success-500' : 'text-light-600'">
              {{ formData[field.path] ? 'Enabled' : 'Disabled' }}
            </span>

            <div v-else-if="field.type === 'array<string>'" class="flex flex-col gap-1 md:w-2/3 md:items-end md:text-right">
              <span v-for="(item, i) in formData[field.path] as string[]" :key="i" class="font-semibold text-sm text-white">{{ item || '—' }}</span>
            </div>

            <span v-else class="font-semibold whitespace-pre-wrap break-words text-sm text-white md:w-2/3 md:text-right">
              {{ String(formData[field.path] || 'Not provided') }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center justify-end gap-6 border-t border-dark-500/50 pt-6 md:flex-row">
        <div class="flex w-full flex-col-reverse gap-3 md:w-auto md:flex-row md:items-center">
          <button v-if="wizardStep === 2" type="button" :disabled="isGenerating" :class="uiStyles.btnSecondary" @click="prevStep">Back</button>

          <button v-if="wizardStep === 0 || wizardStep === 1" type="button" :class="uiStyles.btnPrimary" @click="nextStep">
            Review
            <NuxtIcon name="local:chevron-bold" class="scale-x-[-1]" />
          </button>

          <button v-else :disabled="isGenerating || isPreviewLoading" :class="uiStyles.btnPrimary" @click="onGenerate">
            <NuxtIcon v-if="isGenerating" name="local:loader" class="animate-spin text-lg" />
            {{ isGenerating ? 'Finalizing...' : 'Generate PDF' }}
          </button>
        </div>
      </div>
    </BaseDrawerSidebar>
  </main>
</template>

<style scoped>
/* Required to ensure transparent PDF canvas backgrounds render purely white */
:deep(.vp-container) {
  background: transparent !important;
}
</style>
