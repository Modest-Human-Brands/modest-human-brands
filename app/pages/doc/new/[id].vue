<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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

const { data: template } = await useFetch(`/api/doc/template/${templateId}`)

const formData = ref<Record<string, unknown>>({})
const pdfPreviewBase64 = ref<string | null>(null)
const isPreviewLoading = ref(false)
const isGenerating = ref(false)

const isMobileDrawerOpen = ref(false)
const isLeftOpen = ref(false)
const viewerRef = ref()

const pdfDataUri = computed(() => (pdfPreviewBase64.value ? `data:application/pdf;base64,${pdfPreviewBase64.value}` : ''))

const currentSchema = computed(() => {
  if (!template.value) return []
  const fields: any[] = []

  function traverse(obj: Record<string, unknown>, currentPath = '', parentGroupName = 'General Details', labelPrefix = '') {
    for (const [key, type] of Object.entries(obj)) {
      const path = currentPath ? `${currentPath}.${key}` : key
      const formattedKey = formatKeyToLabel(key)
      const fullLabel = labelPrefix ? `${labelPrefix} ${formattedKey}` : formattedKey

      // 1. Intercept Arrays of Objects
      if (Array.isArray(type)) {
        if (typeof type[0] === 'object' && type[0] !== null) {
          fields.push({
            path,
            label: fullLabel,
            type: 'array<object>',
            groupName: parentGroupName,
            schemaBlueprint: type[0], // Save the inner object schema for the UI
          })
        } else {
          // Standard primitive arrays (e.g. ['string'])
          fields.push({
            path,
            label: fullLabel,
            type: `array<${typeof type[0]}>`,
            groupName: parentGroupName,
          })
        }
      }
      // 2. Standard Nested Objects
      else if (typeof type === 'object' && type !== null) {
        traverse(type as Record<string, unknown>, path, formattedKey, fullLabel)
      }
      // 3. Primitives
      else {
        fields.push({
          path,
          label: fullLabel,
          type: String(type),
          groupName: parentGroupName,
        })
      }
    }
  }

  traverse(template.value.variables)
  return fields
})

onMounted(() => {
  if (currentSchema.value.length) {
    currentSchema.value.forEach((field) => {
      if (field.type === 'array<object>') {
        const initialItem: Record<string, any> = {}
        if (field.schemaBlueprint) {
          for (const [subKey, subType] of Object.entries(field.schemaBlueprint)) {
            initialItem[subKey] = subType === 'number' ? null : subType === 'array<string>' ? [''] : ''
          }
        }
        formData.value[field.path] = [initialItem]
      } else if (field.type === 'array<string>') formData.value[field.path] = ['']
      else if (field.type === 'boolean') formData.value[field.path] = false
      else if (field.type === 'number') formData.value[field.path] = null
      else formData.value[field.path] = ''
    })
    triggerPreview()
  }
})

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
    const response = await $fetch('/api/doc/template', {
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

const wizardStep = ref(0)
const totalSteps = 3

function nextStep() {
  if (wizardStep.value < totalSteps - 1) wizardStep.value++
}
function prevStep() {
  if (wizardStep.value > 0) {
    if (wizardStep.value === 1) navigateTo('/doc')
    wizardStep.value--
  }
}
</script>

<template>
  <main class="relative flex size-full h-full flex-col overflow-hidden bg-dark-500 md:flex-row">
    <div v-if="isLeftOpen" class="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden" @click="isLeftOpen = false" />

    <aside
      :class="[
        isLeftOpen ? 'translate-x-0' : '-translate-x-full',
        'scrollbar-hidden absolute inset-y-0 left-0 z-40 flex w-36 shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-dark-400 p-4 transition-transform duration-300 lg:relative lg:translate-x-0',
      ]">
      <ClientOnly>
        <div v-for="p in viewerRef?.pages" :key="p" class="mb-6 flex flex-col items-center">
          <div
            :class="viewerRef?.viewerState.page === p ? 'border-primary-500' : 'border-transparent'"
            class="aspect-[3/4] w-full shrink-0 cursor-pointer border-2 bg-white transition-all hover:border-primary-500/50"
            @click="viewerRef?.setPage(p)">
            <VuePDF :pdf="viewerRef?.pdf" :page="p" fit-parent />
          </div>
          <span class="font-semibold mt-2 shrink-0 text-xs text-light-500">{{ p }}</span>
        </div>
      </ClientOnly>
    </aside>

    <PdfDocumentViewer ref="viewerRef" :src="pdfDataUri" :is-loading="isPreviewLoading" class="flex-1">
      <template #floating-actions>
        <button class="absolute left-0 top-1/2 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg bg-black/80 text-white lg:hidden" @click="isLeftOpen = true">
          <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-xs" />
        </button>
      </template>
    </PdfDocumentViewer>

    <BaseDrawerSidebar v-model="isMobileDrawerOpen">
      <template #header>
        <h1 class="text-xl font-bold capitalize tracking-tight text-white">
          {{ templateId.replace(/-/g, ' ') }}
        </h1>
        <p class="mt-0.5 text-xs text-light-500">Fill details to update preview</p>
      </template>

      <template #actions>
        <NuxtLink to="/doc/new" class="hidden size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:flex">
          <NuxtIcon name="local:cross" class="text-sm" />
        </NuxtLink>
        <button
          class="flex size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:hidden"
          @click.stop="isMobileDrawerOpen = !isMobileDrawerOpen">
          <NuxtIcon name="local:chevron-bold" class="text-sm transition-transform duration-300" :class="isMobileDrawerOpen ? '-rotate-90' : 'rotate-90'" />
        </button>
      </template>

      <div v-if="wizardStep === 0 || wizardStep === 1" class="flex flex-col gap-6">
        <FormField v-for="field in currentSchema" :key="field.path" v-model="formData[field.path]" :label="field.label" :schema-type="field.type" :schema-blueprint="field.schemaBlueprint" />
      </div>

      <div v-else-if="wizardStep === 2" class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-bold text-white">Review & Generate</h2>
          <p class="text-sm text-light-500">Please review the captured information before finalizing the document.</p>
        </div>

        <div class="flex flex-col gap-0 overflow-hidden rounded-2xl border border-dark-400 bg-dark-500/50">
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

            <div v-else-if="field.type === 'array<object>'" class="mt-2 flex w-full flex-col gap-3 md:mt-0 md:w-2/3 md:items-end">
              <div v-for="(item, i) in formData[field.path] as any[]" :key="i" class="flex w-full flex-col gap-2 rounded border border-dark-400 bg-dark-500/80 p-3 text-left">
                <span class="border-b border-dark-400 pb-1 text-xs font-bold uppercase tracking-wider text-light-500">Item {{ i + 1 }}</span>
                <div v-for="(val, k) in item" :key="k" class="flex items-start justify-between gap-4">
                  <span class="text-xs capitalize text-light-400">{{
                    String(k)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}</span>
                  <div v-if="Array.isArray(val)" class="flex flex-col items-end">
                    <span v-for="(v, vi) in val" :key="vi" class="font-semibold break-words text-right text-xs text-white">{{ v || '—' }}</span>
                  </div>
                  <span v-else class="font-semibold break-words text-right text-xs text-white">{{ String(val || '—') }}</span>
                </div>
              </div>
            </div>

            <span v-else class="font-semibold whitespace-pre-wrap break-words text-sm text-white md:w-2/3 md:text-right">
              {{ String(formData[field.path] || 'Not provided') }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-end gap-6 border-t border-dark-500/50 py-6 md:flex-row">
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
:deep(.vp-container) {
  background: transparent !important;
}
</style>
