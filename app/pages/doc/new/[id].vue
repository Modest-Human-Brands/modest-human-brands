<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const templateId = route.params.id as string

const uiStyles = {
  btnPrimary:
    'flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semi-bold text-dark-500 fill-dark-500 transition-colors hover:bg-light-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto',
  btnSecondary:
    'flex w-full items-center justify-center gap-2 rounded-full border border-dark-400 bg-dark-500 px-6 py-3 text-sm font-semi-bold text-white transition-colors hover:bg-dark-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto',
}

const { data: template } = await useFetch(`/api/doc/template/${templateId}`)

const formData = ref<Record<string, unknown>>({})
const pdfPreviewBase64 = ref<string | null>(null)
const isPreviewLoading = ref(false)
const isGenerating = ref(false)

const isDrawerOpen = ref(false)

const pdfDataUri = computed(() => (pdfPreviewBase64.value ? `data:application/pdf;base64,${pdfPreviewBase64.value}` : ''))

const currentSchema = computed(() => {
  if (!template.value) return []
  const fields: any[] = []

  function traverse(obj: Record<string, unknown>, currentPath = '', parentGroupName = 'General Details', labelPrefix = '') {
    for (const [key, type] of Object.entries(obj)) {
      const path = currentPath ? `${currentPath}.${key}` : key
      const formattedKey = formatKeyToLabel(key)
      const fullLabel = labelPrefix ? `${labelPrefix} ${formattedKey}` : formattedKey

      if (Array.isArray(type)) {
        if (typeof type[0] === 'object' && type[0] !== null) {
          fields.push({
            path,
            label: fullLabel,
            type: 'array<object>',
            groupName: parentGroupName,
            schemaBlueprint: type[0],
          })
        } else {
          fields.push({
            path,
            label: fullLabel,
            type: `array<${typeof type[0]}>`,
            groupName: parentGroupName,
          })
        }
      } else if (typeof type === 'object' && type !== null) {
        traverse(type as Record<string, unknown>, path, formattedKey, fullLabel)
      } else {
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
        formData.value[field.path] = []
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
const totalSteps = 2

function nextStep() {
  if (wizardStep.value < totalSteps - 1) wizardStep.value++
}
function prevStep() {
  if (wizardStep.value > 0) wizardStep.value--
}
</script>

<template>
  <main class="relative flex size-full flex-row overflow-hidden bg-dark-400">
    <PdfDocumentViewer ref="viewerRef" :src="pdfDataUri" :is-loading="isPreviewLoading" class="flex-1" />

    <AppSidebar v-model:open="isDrawerOpen" as-drawer-on-mobile :class="!isDrawerOpen ? 'md:hidden' : 'md:flex'">
      <template #header>
        <h1 class="text-xl font-semi-bold capitalize tracking-tight text-white">
          {{ templateId.replace(/-/g, ' ') }}
        </h1>
        <p class="my-1 mb-3 text-xs text-light-500">Fill details to update preview</p>
      </template>

      <div v-if="wizardStep === 0" class="flex flex-col gap-4">
        <FormField v-for="field in currentSchema" :key="field.path" v-model="formData[field.path]" :label="field.label" :schema-type="field.type" :schema-blueprint="field.schemaBlueprint" />
      </div>

      <div v-else-if="wizardStep === 1" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-semi-bold text-white">Review & Generate</h2>
          <p class="text-sm text-light-500">Please review the captured information before finalizing the document.</p>
        </div>

        <div class="flex flex-col gap-0 overflow-hidden rounded-2xl border border-dark-400 bg-dark-500/50">
          <div v-for="field in currentSchema" :key="field.path" class="flex flex-col gap-1 border-b border-dark-400 p-4 last:border-0 md:flex-row md:items-start md:justify-between">
            <span class="pt-1 text-xs font-semi-bold uppercase tracking-wider text-light-500 md:w-1/3">
              {{ field.groupName === 'General Details' ? field.label : `${field.groupName} → ${field.label}` }}
            </span>

            <span v-if="field.type === 'boolean'" class="text-sm font-semi-bold md:w-2/3 md:text-right" :class="formData[field.path] ? 'text-success-500' : 'text-light-600'">
              {{ formData[field.path] ? 'Enabled' : 'Disabled' }}
            </span>

            <div v-else-if="field.type === 'array<string>'" class="flex flex-col gap-1 md:w-2/3 md:items-end md:text-right">
              <span v-for="(item, i) in formData[field.path] as string[]" :key="i" class="text-sm font-semi-bold text-white">{{ item || '—' }}</span>
            </div>

            <div v-else-if="field.type === 'array<object>'" class="mt-2 flex w-full flex-col gap-3 md:mt-0 md:w-2/3 md:items-end">
              <div v-for="(item, i) in formData[field.path] as any[]" :key="i" class="flex w-full flex-col gap-2 rounded border border-dark-400 bg-dark-500/80 p-3 text-left">
                <span class="border-b border-dark-400 pb-1 text-xs font-semi-bold uppercase tracking-wider text-light-500">Item {{ i + 1 }}</span>
                <div v-for="(val, k) in item" :key="k" class="flex items-start justify-between gap-4">
                  <span class="text-xs capitalize text-light-400">{{
                    String(k)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}</span>
                  <div v-if="Array.isArray(val)" class="flex flex-col items-end">
                    <span v-for="(v, vi) in val" :key="vi" class="break-words text-right text-xs font-semi-bold text-white">{{ v || '—' }}</span>
                  </div>
                  <span v-else class="break-words text-right text-xs font-semi-bold text-white">{{ String(val || '—') }}</span>
                </div>
              </div>
            </div>

            <span v-else class="whitespace-pre-wrap break-words text-sm font-semi-bold text-white md:w-2/3 md:text-right">
              {{ String(formData[field.path] || 'Not provided') }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-end gap-6 border-t border-dark-500/50 py-6 md:flex-row">
        <div class="flex w-full flex-col-reverse gap-3 md:w-auto md:flex-row md:items-center">
          <button v-if="wizardStep === 1" type="button" :disabled="isGenerating" :class="uiStyles.btnSecondary" @click="prevStep">Back</button>

          <button v-if="wizardStep === 0" type="button" :class="uiStyles.btnPrimary" @click="nextStep">
            Review
            <NuxtIcon name="local:chevron-bold" class="scale-x-[-1]" />
          </button>

          <button v-else :disabled="isGenerating || isPreviewLoading" :class="uiStyles.btnPrimary" @click="onGenerate">
            <NuxtIcon v-if="isGenerating" name="local:loader" class="animate-spin text-lg" />
            {{ isGenerating ? 'Finalizing...' : 'Generate PDF' }}
          </button>
        </div>
      </div>

      <template #actions>
        <NuxtLink to="/doc/new" class="hidden size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:flex">
          <NuxtIcon name="local:cross" class="text-sm" />
        </NuxtLink>
        <button class="flex size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:hidden" @click.stop="isDrawerOpen = !isDrawerOpen">
          <NuxtIcon name="local:chevron-bold" class="text-sm transition-transform duration-300" :class="isDrawerOpen ? '-rotate-90' : 'rotate-90'" />
        </button>
      </template>
    </AppSidebar>
  </main>
</template>

<style scoped>
:deep(.vp-container) {
  background: transparent !important;
}
</style>
