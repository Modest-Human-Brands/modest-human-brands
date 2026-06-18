<script setup lang="ts">
import { required } from '@regle/rules'
import { z } from 'zod'

export interface EmailTemplate {
  id: string
  variables: Record<string, string | Record<string, unknown>>
}

defineProps<{
  templates: EmailTemplate[]
}>()

const emit = defineEmits<{
  (e: 'submit', payload: { templateId: string; variables: Record<string, unknown> }): void
}>()

const DEFAULT_ORG = 'modest-human-brands'

const selectedTemplate = ref<EmailTemplate | null>(null)
const templateForm = ref<Record<string, string | number>>({})

const formRules = computed(() => {
  if (!selectedTemplate.value) return {}
  const rulesObj: Record<string, { required: typeof required }> = {}
  for (const key of Object.keys(selectedTemplate.value.variables)) {
    if (key === 'organization') continue
    rulesObj[key] = { required }
  }
  return rulesObj
})

const { r$ } = useRegle(templateForm, formRules)

function getFieldError(key: string | number): string | undefined {
  if (!r$.value) return undefined
  const fields = r$.value.$fields as Record<string, { $errors?: string[] } | undefined> | undefined
  return fields?.[String(key)]?.$errors?.[0]
}

function handleSelectTemplate(tpl: EmailTemplate) {
  if (selectedTemplate.value?.id === tpl.id) {
    selectedTemplate.value = null
    templateForm.value = {}
    r$.value?.$reset()
    return
  }

  selectedTemplate.value = tpl

  const initialForm: Record<string, string | number> = {}
  for (const key of Object.keys(tpl.variables)) {
    if (key !== 'organization') initialForm[key] = ''
  }

  templateForm.value = initialForm
  r$.value?.$reset()
}

function handleSubmit() {
  if (!selectedTemplate.value) return false

  r$.value?.$validate()
  if (r$.value?.$invalid) return false

  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [key, type] of Object.entries(selectedTemplate.value.variables)) {
    if (key === 'organization') continue

    if (type === 'number') {
      shape[key] = z.coerce.number()
    } else if (type === 'array<string>') {
      shape[key] = z.string().transform((val) =>
        val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    } else {
      shape[key] = z.string().min(1, 'Required field')
    }
  }

  const dynamicSchema = z.object(shape)
  const parsed = dynamicSchema.safeParse(templateForm.value)

  if (!parsed.success) return false

  const payloadVariables: Record<string, unknown> = {
    ...parsed.data,
    organization: DEFAULT_ORG,
  }

  emit('submit', {
    templateId: selectedTemplate.value.id,
    variables: payloadVariables,
  })

  selectedTemplate.value = null
  templateForm.value = {}
  r$.value?.$reset()

  return true
}

defineExpose({
  submit: handleSubmit,
  hasSelection: computed(() => !!selectedTemplate.value),
})
</script>

<template>
  <div class="flex w-full shrink-0 flex-col bg-dark-400 pt-4">
    <div class="scrollbar-hidden max-h-[40vh] flex-1 overflow-y-auto px-4 md:px-6">
      <div v-if="!selectedTemplate" class="scrollbar-hidden flex gap-4 overflow-x-auto pb-2">
        <button
          v-for="tpl in templates"
          :key="tpl.id"
          class="hover:border-dark-300 flex w-[160px] shrink-0 flex-col gap-4 rounded-xl border border-dark-400 bg-dark-500 p-4 text-left shadow-sm transition-all hover:bg-dark-600"
          @click="handleSelectTemplate(tpl)">
          <div class="flex size-10 items-center justify-center rounded-lg bg-dark-500 text-light-400">
            <NuxtIcon name="local:document" class="text-xl" />
          </div>
          <span class="text-sm font-bold capitalize leading-tight text-white">{{ tpl.id.replace(/-/g, ' ') }}</span>
        </button>
      </div>

      <div v-else class="mx-auto flex w-full max-w-2xl flex-col">
        <div class="mb-6 flex items-center gap-3">
          <button class="flex items-center justify-center text-light-500 transition-colors hover:text-white" @click="selectedTemplate = null">
            <NuxtIcon name="local:chevron-bold" class="scale-x text-lg" />
          </button>
          <h3 class="text-xl font-bold capitalize text-white">{{ selectedTemplate.id.replace(/-/g, ' ') }}</h3>
        </div>

        <template v-for="(type, key) in selectedTemplate.variables" :key="key">
          <ConnectFormField v-if="key !== 'organization'" v-model="templateForm[String(key)]" :label="String(key)" :schema-type="String(type)" :error-message="getFieldError(String(key))" />
        </template>
      </div>
    </div>
  </div>
</template>
