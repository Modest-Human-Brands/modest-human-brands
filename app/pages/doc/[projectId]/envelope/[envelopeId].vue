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

interface MDocTemplate {
  id: string
  label: string
  description: string
  variables: Record<string, string>
  signerFields: {
    id: string
    type: string
    signerOrder: number
    pageIndex: number | number[] | string
    x: number
    y: number
    width: number
    height: number
    required: boolean
    fontSize?: string
  }[]
}

interface DscCertificate {
  index: number
  subject: string
  issuer: string
  certificateDerHex: string
  certificateChainDerHex: string
}

const LOCAL_DSC_BRIDGE_URL = 'http://localhost:8720'

const route = useRoute()

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

const { data: verifyData, error: verifyError } = await useFetch(`/api/doc/${projectId}/${envelopeId}/session/verify`, {
  method: 'POST',
  body: { sessionToken: token },
})

if (verifyError.value) {
  verificationError.value = verifyError.value.data?.statusMessage || 'This secure link is invalid, expired, or already used.'
} else if (verifyData.value) {
  signerDetails.value = verifyData.value
}
isVerifying.value = false

const signingMethod = ref<'server' | 'dsc'>('server')
const dscCertificates = ref<DscCertificate[]>([])
const selectedCertIndex = ref<number>(0)
const isFetchingCerts = ref(false)
const dscError = ref<string | null>(null)

const { data: doc } = await useFetch<MDocDocument>(`/api/doc/${projectId}/${envelopeId}`)

if (!doc.value || !doc.value?.templateId) {
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })
}

const { data: template } = await useFetch<MDocTemplate>(`/api/doc/template/${doc.value.templateId}`)

const originalSignerFields = computed(() => {
  if (!template.value) return []
  return template.value?.signerFields || []
})

const currentSignerFields = computed(() => {
  if (!signerDetails.value) return []
  return originalSignerFields.value.filter((f) => f.signerOrder === signerDetails.value?.order)
})
const textFields = computed(() => currentSignerFields.value.filter((f) => f.type !== 'SIGNATURE'))
const signatureFields = computed(() => currentSignerFields.value.filter((f) => f.type === 'SIGNATURE'))

const formData = ref<Record<string, string>>({})
const masterSignature = ref<string | null>(null)

async function fetchDscCertificates() {
  isFetchingCerts.value = true
  dscError.value = null
  try {
    const response = await $fetch<{ certificates: DscCertificate[] }>(`${LOCAL_DSC_BRIDGE_URL}/api/certificates`)
    dscCertificates.value = response.certificates || []
    if (dscCertificates.value.length > 0) {
      selectedCertIndex.value = dscCertificates.value[0]!.index
    } else {
      dscError.value = 'No digital certificates found on plugged USB tokens.'
    }
  } catch (error) {
    console.error('Local DSC bridge error:', error)
    dscError.value = 'Could not connect to DSC Bridge. Ensure the Windows service is running and USB stick is inserted.'
  } finally {
    isFetchingCerts.value = false
  }
}

watch(signingMethod, (method) => {
  if (method === 'dsc' && dscCertificates.value.length === 0) {
    fetchDscCertificates()
  }
})

function getFieldsForPage(pageIndex: number, totalPages: number) {
  return currentSignerFields.value.filter((f) => {
    if (f.pageIndex === -1 && pageIndex === totalPages) return true
    if (f.pageIndex === 'all-except-last' && pageIndex < totalPages) return true
    if (f.pageIndex === pageIndex) return true
    return false
  })
}

async function submitSignature() {
  if (signingMethod.value === 'dsc' && dscCertificates.value.length === 0) {
    alert('Please insert your USB DSC token and load your certificate first.')
    return
  }

  isSubmitting.value = true
  const finalFields: Record<string, string> = { ...formData.value }
  signatureFields.value.forEach((f) => {
    if (masterSignature.value) finalFields[f.id] = masterSignature.value
  })

  try {
    const { sessionId, digestHex } = await $fetch<{
      sessionId: string
      digestHex: string
    }>(`/api/doc/${projectId}/${envelopeId}/sign/prepare`, {
      method: 'POST',
      body: {
        sessionToken: token,
        certificateDerHex: dscCertificates.value[selectedCertIndex.value]!.certificateDerHex,
        certificateChainDerHex: dscCertificates.value[selectedCertIndex.value]!.certificateChainDerHex,
        fields: finalFields,
        telemetry: { userAgent: navigator.userAgent },
      },
    })

    if (signingMethod.value === 'server') {
      await $fetch(`/api/doc/${projectId}/${envelopeId}/sign/server`, {
        method: 'POST',
        body: { sessionId, sessionToken: token },
      })
    } else if (signingMethod.value === 'dsc') {
      const dscResponse = await $fetch<{ signatureHex: string }>(`${LOCAL_DSC_BRIDGE_URL}/api/sign-hash`, {
        method: 'POST',
        query: {
          digest_hex: digestHex,
          cert_index: selectedCertIndex.value,
        },
      })

      console.log({
        sessionId,
        signatureHex: dscResponse.signatureHex,
        sessionToken: token,
      })

      await $fetch(`/api/doc/${projectId}/${envelopeId}/sign/client`, {
        method: 'POST',
        body: {
          sessionId,
          signatureHex: dscResponse.signatureHex,
          sessionToken: token,
        },
      })
    }

    isSuccess.value = true
  } catch (error) {
    console.error('Signing workflow failed:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex size-full h-dvh flex-col overflow-hidden bg-dark-500 md:flex-row">
    <div v-if="verificationError || !doc" class="animate-fade-in flex h-full w-full flex-col items-center justify-center p-6 text-center">
      <div class="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-alert-500/20 text-alert-500">
        <NuxtIcon name="local:cross" class="text-5xl" />
      </div>
      <h2 class="text-2xl font-semi-bold text-white">Access Denied</h2>
      <p class="mt-2 max-w-md px-4 text-sm leading-relaxed text-light-400">
        {{ verificationError }}
      </p>
    </div>

    <template v-else>
      <PdfDocumentViewer ref="viewerRef" :src="doc.previewUrl" :doc="{ id: envelopeId, name: doc?.name, previewUrl: doc?.previewUrl }">
        <template #page-overlay="{ page, scale, viewportHeight, totalPages }">
          <div
            v-for="f in getFieldsForPage(page, totalPages)"
            :key="f.id"
            class="absolute z-10 flex items-center justify-center overflow-hidden border border-primary-500/50 bg-primary-500/10 text-black transition-colors"
            :style="{ top: `${(viewportHeight - f.y - f.height) * scale}px`, left: `${f.x * scale}px`, width: `${f.width * scale}px`, height: `${f.height * scale}px` }">
            <NuxtImg v-if="f.type === 'SIGNATURE' && masterSignature" :src="masterSignature" class="size-full object-contain p-1" />
            <span
              v-else-if="f.type !== 'SIGNATURE' && formData[f.id]"
              :style="{ fontSize: `${(f.fontSize ? Number(f.fontSize) : 12) * scale}px` }"
              class="px-2 text-center font-semi-bold tracking-wide">
              {{ formData[f.id] }}
            </span>
            <span v-else class="text-[8px] font-semi-bold uppercase tracking-widest opacity-60 md:text-[10px]">
              {{ f.type }}
            </span>
          </div>
        </template>
      </PdfDocumentViewer>

      <AppSidebar v-model:open="isSignDrawerOpen">
        <template #header>
          <h2 class="text-xl font-semi-bold tracking-tight text-white">{{ isSuccess ? 'Completed' : 'Complete Fields' }}</h2>
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
            <h2 class="text-2xl font-semi-bold text-white">Document Signed!</h2>
            <p class="mt-2 px-4 text-sm leading-relaxed text-light-400">Your signature has been securely applied and the document has been sealed. A final copy will be emailed to you shortly.</p>
          </div>
          <button class="hover:bg-dark-300 mx-auto mt-4 w-full max-w-52 rounded-full bg-dark-500 px-6 py-3 text-sm font-semi-bold text-white transition-colors" @click="navigateTo('/doc')">
            Close Window
          </button>
        </div>

        <div v-else class="animate-fade-in flex flex-col">
          <div class="flex flex-col gap-6">
            <FormField v-for="field in textFields" :key="field.id" v-model="formData[field.id]" :label="formatKeyToLabel(field.id)" :schema-type="field.type" />

            <div v-if="signatureFields.length" class="flex flex-col gap-1">
              <FormField v-model="masterSignature" label="Your Signature" schema-type="SIGNATURE" />
            </div>

            <div class="flex flex-col gap-3 rounded-2xl border border-dark-400 bg-dark-500/30 p-4">
              <span class="text-xs font-semi-bold uppercase tracking-wider text-light-500">Signing Method</span>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                  :class="signingMethod === 'server' ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-dark-400 bg-dark-500 text-light-500 hover:text-white'"
                  @click="signingMethod = 'server'">
                  <NuxtIcon name="local:cloud" class="text-xl" />
                  <span class="text-xs font-semi-bold">Cloud Electronic</span>
                </button>

                <button
                  type="button"
                  class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                  :class="signingMethod === 'dsc' ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-dark-400 bg-dark-500 text-light-500 hover:text-white'"
                  @click="signingMethod = 'dsc'">
                  <NuxtIcon name="local:usb" class="text-xl" />
                  <span class="text-xs font-semi-bold">USB DSC Token</span>
                </button>
              </div>

              <div v-if="signingMethod === 'dsc'" class="mt-2 flex flex-col gap-3 border-t border-dark-400 pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-regular text-light-400">USB Crypto Stick</span>
                  <button type="button" class="hover:text-primary-300 flex items-center gap-1 text-xs font-semi-bold text-primary-400" @click="fetchDscCertificates">
                    <NuxtIcon :name="isFetchingCerts ? 'local:loader' : 'local:refresh'" :class="{ 'animate-spin': isFetchingCerts }" />
                    {{ isFetchingCerts ? 'Detecting...' : 'Refresh Token' }}
                  </button>
                </div>

                <div v-if="dscError" class="rounded-xl border border-alert-500/30 bg-alert-500/10 p-3 text-xs text-alert-400">
                  {{ dscError }}
                </div>

                <select
                  v-else-if="dscCertificates.length > 0"
                  v-model="selectedCertIndex"
                  class="w-full rounded-xl border border-dark-400 bg-dark-500 p-2.5 text-xs text-white outline-none focus:border-white">
                  <option v-for="cert in dscCertificates" :key="cert.index" :value="cert.index">{{ cert.subject }} ({{ cert.issuer }})</option>
                </select>

                <p v-else-if="!isFetchingCerts" class="text-center text-xs italic text-light-500">No DSC USB sticks detected.</p>
              </div>
            </div>
          </div>

          <div class="mt-4 border-t border-dark-500/50 pt-6">
            <button
              :disabled="isSubmitting || (!masterSignature && signatureFields.length > 0) || (signingMethod === 'dsc' && dscCertificates.length === 0)"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-semi-bold text-dark-500 shadow-sm transition-colors hover:bg-light-400 disabled:cursor-not-allowed disabled:opacity-50"
              @click="submitSignature">
              <NuxtIcon v-if="isSubmitting" name="local:loader" class="animate-spin text-lg" />
              {{ isSubmitting ? 'Sealing Document...' : 'I Agree & Sign' }}
            </button>
          </div>
        </div>
      </AppSidebar>
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
