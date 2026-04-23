<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEMPLATES = ['quotation', 'internship-completion-certificate'] as const
type TemplateName = (typeof TEMPLATES)[number]

interface QuotationPayload {
  logoUrl: string
  client: { name: string; address: string; email: string; phone: string }
  project: {
    quoteNumber: string
    quoteDate: string
    quoteExpiry: string
    shootDate: string
    shootLocation: string
  }
  budgetMarkdown: string
  termsMarkdown: string
}

interface InternshipCompletionCertificatePayload {
  recipientName: string
  recipientRole: string
  scopeOfWork: string
  startDate: string
  endDate: string
  dataOfIssue: string
  signerSignature: string
  signerName: string
  signerTitle: string
  companyName: string
  companylogoUrl: string
}

interface FormField {
  key: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'date' | 'image'
  placeholder?: string
  spanFull?: boolean
}

// --- Scalable Form Configuration ---
const templateSchemas: Record<TemplateName, FormField[]> = {
  quotation: [
    { key: 'logoUrl', label: 'Company Logo', type: 'image', spanFull: true },
    { key: 'client_name', label: 'Client Name', type: 'text', placeholder: 'Acme Corp' },
    { key: 'client_email', label: 'Client Email', type: 'email', placeholder: 'contact@acme.com' },
    { key: 'client_phone', label: 'Client Phone', type: 'text', placeholder: '+1 234 567 890' },
    { key: 'client_address', label: 'Client Address', type: 'text', placeholder: '123 Main St, City' },
    { key: 'project_quoteNumber', label: 'Quote Number', type: 'text', placeholder: 'QT-2026-001' },
    { key: 'project_quoteDate', label: 'Quote Date', type: 'date' },
    { key: 'project_shootDate', label: 'Shoot Date', type: 'date' },
    { key: 'project_quoteExpiry', label: 'Quote Expiry Date', type: 'date' },
    { key: 'project_shootLocation', label: 'Shoot Location', type: 'text', placeholder: 'Studio A', spanFull: true },
    { key: 'budgetMarkdown', label: 'Project Budget (Markdown)', type: 'textarea', placeholder: '- Item 1: $500\n- Item 2: $300', spanFull: true },
    { key: 'termsMarkdown', label: 'Terms & Conditions (Markdown)', type: 'textarea', placeholder: 'Standard terms apply...', spanFull: true },
  ],
  'internship-completion-certificate': [
    { key: 'recipientName', label: 'Recipient Name', type: 'text', placeholder: 'Jane Doe' },
    { key: 'recipientRole', label: 'Role', type: 'text', placeholder: 'Frontend Developer' },
    { key: 'scopeOfWork', label: 'Scope of Work', type: 'text', placeholder: 'Developed user interfaces...', spanFull: true },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' },
    { key: 'dataOfIssue', label: 'Date of Issue', type: 'date' },
    { key: 'signerName', label: 'Signer Name', type: 'text', placeholder: 'John Smith' },
    { key: 'signerTitle', label: 'Signer Title', type: 'text', placeholder: 'CEO' },
    { key: 'signerSignature', label: 'Signer Signature', type: 'image' },
    { key: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Modest Human Brands' },
    { key: 'companylogoUrl', label: 'Company Logo', type: 'image' },
  ],
}

// --- State ---
const config = useRuntimeConfig()
const { data: templateResponse, status: templateStatus } = useFetch('/api/document/generate', { baseURL: config.public.docUrl })
const templates = computed(() => templateResponse.value?.templates || [])

const selectedTemplate = ref<TemplateName | null>(null)
const isGenerating = ref(false)
const formData = ref<Record<string, string>>({})
const currentSchema = computed(() => (selectedTemplate.value ? templateSchemas[selectedTemplate.value] : []))

// --- Logic: Image Handling ---
const activeUploadField = ref<string | null>(null)
const activeFile = ref<File | null>(null)
const { base64: activeFileBase64 } = useBase64(activeFile)
const { open: openFileDialog, onChange: onFileChange } = useFileDialog({
  accept: 'image/png, image/jpeg, image/webp',
  multiple: false,
})

onFileChange((files) => {
  if (files && files.length > 0) activeFile.value = files[0]
})

watch(activeFileBase64, (newBase64) => {
  if (newBase64 && activeUploadField.value) {
    formData.value[activeUploadField.value] = newBase64
  }
})

function triggerImageUpload(key: string) {
  activeUploadField.value = key
  activeFile.value = null
  openFileDialog()
}

// --- Logic: Generation ---
watch(selectedTemplate, (newTemplate) => {
  formData.value = {}
  if (newTemplate) {
    templateSchemas[newTemplate].forEach((field) => {
      formData.value[field.key] = ''
    })
  }
})

function buildPayload(): QuotationPayload | InternshipCompletionCertificatePayload {
  if (selectedTemplate.value === 'quotation') {
    return {
      logoUrl: formData.value.logoUrl,
      client: {
        name: formData.value.client_name,
        address: formData.value.client_address,
        email: formData.value.client_email,
        phone: formData.value.client_phone,
      },
      project: {
        quoteNumber: formData.value.project_quoteNumber,
        quoteDate: formData.value.project_quoteDate,
        quoteExpiry: formData.value.project_quoteExpiry,
        shootDate: formData.value.project_shootDate,
        shootLocation: formData.value.project_shootLocation,
      },
      budgetMarkdown: formData.value.budgetMarkdown,
      termsMarkdown: formData.value.termsMarkdown,
    } as QuotationPayload
  }
  return { ...formData.value } as unknown as InternshipCompletionCertificatePayload
}

async function onGenerate() {
  if (!selectedTemplate.value) return

  isGenerating.value = true
  const payloadData = buildPayload()

  try {
    // API should return { id: string, ... } metadata instead of Blob
    const response = await $fetch<DocumentMeta>('/api/document/generate', {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: {
        template: selectedTemplate.value,
        data: payloadData,
      },
    })

    // Redirect to the viewer page rather than downloading
    if (response?.id) {
      await navigateTo(`/doc/${response.id}`)
    }
  } catch (error) {
    console.error('Failed to generate document:', error)
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <section class="flex h-full w-full flex-col items-center overflow-y-auto p-2 md:p-2.5">
    <header class="mb-8 flex w-full max-w-4xl items-center justify-between gap-8 px-4">
      <div>
        <h1 class="text-2xl font-bold uppercase tracking-tight text-white">Generate Document</h1>
        <span class="mt-1 text-sm text-light-600 opacity-70">
          {{ selectedTemplate ? 'Fill out the details below to generate your PDF.' : 'Select a template to begin.' }}
        </span>
      </div>
      <button
        v-if="selectedTemplate"
        class="font-medium rounded-lg bg-dark-500 px-4 py-2 text-sm text-white ring-1 ring-dark-600 transition-colors hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
        @click="selectedTemplate = null">
        ← Back to Templates
      </button>
    </header>

    <section v-if="!selectedTemplate" class="grid w-full max-w-4xl grid-cols-1 gap-5 px-4 md:grid-cols-2">
      <div v-if="templateStatus === 'pending'" class="text-light-600">Loading templates...</div>

      <button
        v-for="tpl in templates"
        :key="tpl.id"
        class="flex flex-col items-start gap-3 rounded-2xl bg-dark-500 p-6 text-left shadow-xl ring-1 ring-dark-600 transition-all hover:ring-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
        @click="selectedTemplate = tpl.id as TemplateName">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-dark-600 text-white">
          <NuxtIcon name="local:file" class="text-[24px]" />
        </div>
        <div>
          <h2 class="font-semibold text-lg text-white">{{ tpl.label || tpl.id }}</h2>
          <p class="mt-1 text-sm text-light-600">{{ tpl.description || 'Generate a new document using this template.' }}</p>
        </div>
      </button>
    </section>

    <section v-else class="w-full max-w-4xl rounded-2xl bg-dark-500 p-6 shadow-xl ring-1 ring-dark-600 md:p-8">
      <form class="flex flex-col gap-6" @submit.prevent="onGenerate">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div v-for="field in currentSchema" :key="field.key" class="flex flex-col gap-3" :class="{ 'md:col-span-2': field.spanFull }">
            <label :for="field.key" class="font-medium text-sm text-light-500">{{ field.label }}</label>

            <textarea
              v-if="field.type === 'textarea'"
              :id="field.key"
              v-model="formData[field.key]"
              rows="4"
              :placeholder="field.placeholder"
              class="w-full rounded-lg bg-transparent px-4 py-3 text-white ring-2 ring-dark-600 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400"
              required></textarea>

            <div v-else-if="field.type === 'image'" class="flex items-center gap-4">
              <div v-if="formData[field.key]" class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-dark-600 ring-1 ring-dark-600">
                <img :src="formData[field.key]" alt="Preview" class="h-full w-full object-contain" />
              </div>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-dark-600 px-4 py-2 text-sm text-white transition-colors hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                @click="triggerImageUpload(field.key)">
                <NuxtIcon name="local:file" class="text-lg" />
                {{ formData[field.key] ? 'Change Image' : 'Upload Image' }}
              </button>
              <button v-if="formData[field.key]" type="button" class="text-xs text-alert-500 transition-colors hover:text-alert-400 hover:underline" @click="formData[field.key] = ''">Remove</button>
            </div>

            <input
              v-else
              :id="field.key"
              v-model="formData[field.key]"
              :type="field.type"
              :placeholder="field.placeholder"
              class="w-full rounded-lg bg-transparent px-4 py-3 text-white ring-2 ring-dark-600 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400"
              required />
          </div>
        </div>

        <hr class="my-2 border-dark-600" />

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isGenerating"
            class="font-medium flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base text-black transition-all disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">
            <NuxtIcon v-if="isGenerating" name="local:loader" class="animate-spin text-[24px]" />
            {{ isGenerating ? 'Generating...' : 'Generate PDF' }}
          </button>
        </div>
      </form>
    </section>
  </section>
</template>
