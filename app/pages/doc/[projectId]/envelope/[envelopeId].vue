<script setup lang="ts">
definePageMeta({ layout: false })

interface MDocDocument {
  id: string
  templateId: string
  name: string
  mimeType: string
  sizeBytes: number
  status: string
  projectId: string | null
  project: {
    id: string
    name: string
    contact: {
      id: string
      name: string
      email: string
    }
  } | null
  organizationId: string | null
  categories: string[]
  previewUrl: string
  createdAt: string
  updatedAt: string
  routingType?: string
  nextSigner?: string
  routingQueue?: {
    order: number
    name: string
    email: string
    role: string
    status: string
  }[]
  extension?: string
  formattedSize?: string
  timeline?: {
    id: string
    date: string
    time: string
    userInitials: string
    userName: string
    action: string
  }[]
}

const route = useRoute()
const config = useRuntimeConfig()

const projectId = route.params.projectId as string
const envelopeId = route.params.envelopeId as string
const token = route.query.token as string

const isSignDrawerOpen = ref(false)
const isSubmitting = ref(false)
const isSuccess = ref(false)

const isVerifying = ref(true)
const verificationError = ref<string | null>(null)
const signerDetails = ref<{
  isValid: boolean
  signerEmail: string
  role: string
  order: number
  status: string
} | null>(null)

const { data: verifyData, error: verifyError } = await useFetch(`/api/doc/${projectId}/${envelopeId}/verify-session`, {
  method: 'POST',
  body: { sessionToken: token },
})

if (verifyError.value) {
  verificationError.value = verifyError.value.data?.statusMessage || 'This secure link is invalid, expired, or already used.'
} else if (verifyData.value) {
  signerDetails.value = verifyData.value
}
isVerifying.value = false

const { data: doc } = await useFetch<MDocDocument>(`/api/doc/${projectId}/${envelopeId}`)
const pdfUrl = computed(() => (doc.value?.previewUrl ? `${config.public.docUrl}${doc.value.previewUrl}` : ''))

if (!doc.value || !doc.value?.templateId) {
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })
}

const { data: template } = await useFetch(`/api/doc/template/${doc.value.templateId}`)

const originalSignerFields = computed(() => {
  if (!template.value) return []
  const schema = Array.isArray(template.value) ? template.value[0] : template.value
  return schema?.signerFields || []
})

const currentSignerFields = computed(() => {
  if (!signerDetails.value) return []
  return originalSignerFields.value.filter((f) => f.signerOrder === signerDetails.value?.order)
})
const textFields = computed(() => currentSignerFields.value.filter((f) => f.type !== 'SIGNATURE'))
const signatureFields = computed(() => currentSignerFields.value.filter((f) => f.type === 'SIGNATURE'))

const formData = ref<Record<string, string>>({})
const masterSignature = ref<string | null>(null)

function getFieldsForPage(pageIndex: number, totalPages: number) {
  return currentSignerFields.value.filter((f) => {
    if (f.pageIndex === -1 && pageIndex === totalPages) return true
    if (f.pageIndex === 'all-except-last' && pageIndex < totalPages) return true
    if (f.pageIndex === pageIndex) return true
    return false
  })
}

async function submitSignature() {
  isSubmitting.value = true
  const finalFields: Record<string, string> = { ...formData.value }
  signatureFields.value.forEach((f) => {
    if (masterSignature.value) finalFields[f.id] = masterSignature.value
  })

  try {
    await $fetch(`/api/doc/${projectId}/${envelopeId}/sign`, {
      method: 'POST',
      body: { sessionToken: token, fields: finalFields, telemetry: { userAgent: navigator.userAgent } },
    })
    isSuccess.value = true
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex size-full h-dvh flex-col overflow-hidden bg-dark-500 md:flex-row">
    <div v-if="verificationError" class="animate-fade-in flex h-full w-full flex-col items-center justify-center p-6 text-center">
      <div class="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-alert-500/20 text-alert-500">
        <NuxtIcon name="local:cross" class="text-5xl" />
      </div>
      <h2 class="text-2xl font-bold text-white">Access Denied</h2>
      <p class="mt-2 max-w-md px-4 text-sm leading-relaxed text-light-400">
        {{ verificationError }}
      </p>
    </div>

    <template v-else>
      <PdfDocumentViewer ref="viewerRef" :src="pdfUrl" :doc="{ id: envelopeId, name: doc?.name, previewUrl: doc?.previewUrl }">
        <template #page-overlay="{ page, scale, viewportHeight, totalPages }">
          <div
            v-for="f in getFieldsForPage(page, totalPages)"
            :key="f.id"
            class="absolute z-10 flex items-center justify-center overflow-hidden border border-primary-500/50 bg-primary-500/10 text-black transition-colors"
            :style="{ top: `${(viewportHeight - f.y - f.height) * scale}px`, left: `${f.x * scale}px`, width: `${f.width * scale}px`, height: `${f.height * scale}px` }">
            <img v-if="f.type === 'SIGNATURE' && masterSignature" :src="masterSignature" class="size-full object-contain p-1" />
            <span v-else-if="f.type !== 'SIGNATURE' && formData[f.id]" :style="{ fontSize: `${(f.fontSize || 12) * scale}px` }" class="font-semibold px-2 text-center tracking-wide">
              {{ formData[f.id] }}
            </span>
            <span v-else class="text-[8px] font-bold uppercase tracking-widest opacity-60 md:text-[10px]">
              {{ f.type }}
            </span>
          </div>
        </template>
      </PdfDocumentViewer>

      <BaseDrawerSidebar v-model="isSignDrawerOpen">
        <template #header>
          <h2 class="text-xl font-bold tracking-tight text-white">{{ isSuccess ? 'Completed' : 'Complete Fields' }}</h2>
        </template>
        <template #actions>
          <button class="flex size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white" @click="isSignDrawerOpen = false">
            <NuxtIcon name="local:cross" class="hidden text-sm md:block" />
            <NuxtIcon name="local:chevron-bold" class="rotate-90 text-sm md:hidden" />
          </button>
        </template>

        <div v-if="isSuccess" class="animate-fade-in flex h-full flex-col justify-center gap-6 pb-20 text-center">
          <div class="mx-auto flex size-24 items-center justify-center rounded-full bg-success-500/20 text-success-500">
            <NuxtIcon name="local:check-circle" class="text-6xl" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">Document Signed!</h2>
            <p class="mt-2 px-4 text-sm leading-relaxed text-light-400">Your signature has been securely applied and the document has been sealed. A final copy will be emailed to you shortly.</p>
          </div>
          <button class="hover:bg-dark-300 mx-auto mt-4 w-full max-w-52 rounded-full bg-dark-500 px-6 py-3 text-sm font-bold text-white transition-colors" @click="navigateTo('/doc')">
            Close Window
          </button>
        </div>

        <div v-else class="animate-fade-in flex flex-col gap-6">
          <div class="flex flex-col gap-6">
            <FormField v-for="field in textFields" :key="field.id" v-model="formData[field.id]" :label="formatKeyToLabel(field.id)" :schema-type="field.type" />

            <div v-if="signatureFields.length" class="flex flex-col gap-1">
              <FormField v-model="masterSignature" label="Your Signature" schema-type="SIGNATURE" />
            </div>
          </div>

          <div class="mt-4 border-t border-dark-500/50 pt-6">
            <button
              :disabled="isSubmitting || (!masterSignature && signatureFields.length > 0)"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-bold text-dark-500 shadow-sm transition-colors hover:bg-light-400 disabled:cursor-not-allowed disabled:opacity-50"
              @click="submitSignature">
              <NuxtIcon v-if="isSubmitting" name="local:loader" class="animate-spin text-lg" />
              {{ isSubmitting ? 'Sealing Document...' : 'I Agree & Sign' }}
            </button>
          </div>
        </div>
      </BaseDrawerSidebar>
    </template>
  </main>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}
</style>
