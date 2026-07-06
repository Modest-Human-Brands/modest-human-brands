<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

definePageMeta({
  layout: false,
  middleware: ['auth'],
})

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
  rawData: Record<string, string>
  verificationData?: {
    isIntact: boolean
    signer: string
    message: string
  } | null
}

interface MDocTemplateResponse {
  id: string
  variables: Record<string, string>
  signerFields: {
    id: string
    type: string
    signerOrder: number
    pageIndex: string
    x: number
    y: number
    width: number
    height: number
    required: boolean
    fontSize?: string
  }[]
}

const route = useRoute()
const config = useRuntimeConfig()
const projectId = route.params.projectId as string
const docId = route.params.docId as string

const { data: doc, refresh } = await useFetch<MDocDocument>(`/api/doc/${projectId}/${docId}`)
const pdfUrl = computed(() => (!doc.value ? '' : `${config.public.docUrl}${doc.value.previewUrl}`))

const isDrawerOpen = ref(false)

const isSendingEnvelope = ref(false)
const magicLink = ref('')
const isGeneratingLink = ref<string | null>(null)
const isCopied = ref(false)

if (!doc.value?.templateId) throw createError({ status: 404, message: 'Template not found' })

const { data: template } = await useFetch<MDocTemplateResponse>(`/api/doc/template/${doc.value.templateId}`)

const requiredSignerOrders = computed(() => {
  if (!template.value) return [1]
  if (!template.value?.signerFields) return [1]

  const orders = new Set<number>()
  template.value.signerFields.forEach((f) => orders.add(f.signerOrder))
  return Array.from(orders).sort((a, b) => a - b)
})

const envelopeSigners = ref<{ order: number; name: string; email: string; role: string }[]>([])

watchEffect(() => {
  if (doc.value && requiredSignerOrders.value.length > 0 && envelopeSigners.value.length === 0) {
    envelopeSigners.value = requiredSignerOrders.value.map((order, index) => {
      if (index === 0 && doc.value?.project?.contact) {
        return {
          order,
          name: doc.value.project.contact.name || '',
          email: doc.value.project.contact.email || '',
          role: 'Client',
        }
      }
      return { order, name: '', email: '', role: 'Signer' }
    })
  }
})

function getInitials(name?: string) {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const isEnvelopeValid = computed(() => {
  return envelopeSigners.value.every((s) => s.name.trim() !== '' && s.email.trim() !== '' && s.email.includes('@'))
})

async function sendForSignature() {
  isSendingEnvelope.value = true
  try {
    await $fetch(`/api/doc/${projectId}/${docId}/envelope`, {
      method: 'POST',
      body: {
        expiresInDays: 7,
        routingType: 'SEQUENTIAL',
        signers: envelopeSigners.value,
      },
    })

    await refresh()
  } catch (error) {
    console.error('Failed to create envelope:', error)
  } finally {
    isSendingEnvelope.value = false
  }
}

async function generateSessionLink(signerName: string, signerEmail: string, signerIsContact: boolean) {
  isGeneratingLink.value = signerEmail
  try {
    const res = await $fetch(`/api/doc/${projectId}/${docId}/session`, {
      method: 'POST',
      body: { signerName, signerEmail, signerIsContact },
    })

    magicLink.value = res.magicLink
  } catch (error) {
    console.error('Failed to generate session link:', error)
  } finally {
    isGeneratingLink.value = null
  }
}

async function copyLink() {
  if (!magicLink.value) return
  await navigator.clipboard.writeText(magicLink.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isDrawerOpen.value = false
  }
})
</script>

<template>
  <main v-if="doc" class="relative flex h-screen w-screen flex-row overflow-hidden bg-dark-400">
    <PdfDocumentViewer ref="viewerRef" :src="pdfUrl" :doc="{ id: docId, name: doc.name, previewUrl: doc.previewUrl }" class="flex-1">
      <template #toolbar-actions>
        <button type="button" class="shrink-0 transition-colors hover:text-primary-500" :class="isDrawerOpen ? 'text-primary-500' : 'text-white'" @click="isDrawerOpen = true">
          <NuxtIcon name="local:signature" class="text-xl" />
        </button>
      </template>
    </PdfDocumentViewer>

    <AppSidebar v-model:open="isDrawerOpen" as-drawer-on-mobile :class="!isDrawerOpen ? 'md:hidden' : 'md:flex'">
      <template #header>
        <div class="flex items-start justify-between px-2 pb-4 pt-2">
          <div>
            <h2 class="text-xl font-semi-bold tracking-tight text-white">Document Details</h2>
            <p class="mt-0.5 text-sm text-light-500">Properties & signatures</p>
          </div>

          <!-- <div class="flex items-center gap-2">
            <button
              class="flex size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white"
              @click="isDrawerOpen = false">
              <NuxtIcon name="local:cross" class="text-sm" />
            </button>
          </div> -->
        </div>
      </template>

      <div class="animate-fade-in flex flex-col gap-8 px-2 pb-6">
        <div
          v-if="doc.verificationData"
          class="flex flex-col gap-2 rounded-xl p-4 transition-colors"
          :class="doc.verificationData.isIntact ? 'border border-success-500/30 bg-success-500/10' : 'border border-alert-500/30 bg-alert-500/10'">
          <div class="flex items-center gap-3">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full text-white" :class="doc.verificationData.isIntact ? 'bg-success-500' : 'bg-alert-500'">
              <NuxtIcon :name="doc.verificationData.isIntact ? 'local:check' : 'local:cross'" class="text-sm" />
            </div>
            <div class="flex flex-col">
              <h3 class="text-sm font-bold" :class="doc.verificationData.isIntact ? 'text-success-500' : 'text-alert-500'">
                {{ doc.verificationData.isIntact ? 'Signed and all signatures are valid.' : 'Signature Validation Failed' }}
              </h3>
              <p class="text-[11px] font-semi-bold text-light-400">
                {{ doc.verificationData.message }}
              </p>
            </div>
          </div>
          <p v-if="doc.verificationData.signer !== 'Unknown'" class="font-medium mt-2 border-t border-white/5 pt-2 text-xs text-light-500">
            Signed by: <span class="text-white">{{ doc.verificationData.signer }}</span>
          </p>
        </div>

        <!-- Merged View: Metadata Section -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <NuxtIcon :name="`local:file-${doc.extension?.toLowerCase() || 'pdf'}`" class="text-4xl text-white/20" />
            <div class="flex flex-col overflow-hidden">
              <h4 class="truncate text-base font-semi-bold text-white" :title="doc.name">{{ doc.name }}</h4>
              <p class="text-sm text-light-500">{{ doc.formattedSize || 'Unknown Size' }}</p>
            </div>
          </div>
        </div>

        <div class="h-px w-full bg-white/10" />

        <!-- Merged View: Signatures Section -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semi-bold text-white">Signature Routing</h3>
            <span
              v-if="doc?.routingQueue?.length"
              class="rounded-full px-2 py-0.5 text-[10px] font-semi-bold uppercase tracking-wider"
              :class="doc.status === 'Completed' ? 'bg-success-500/20 text-success-500' : 'bg-primary-500/20 text-primary-500'">
              {{ doc.status }}
            </span>
          </div>

          <div v-if="doc?.routingQueue?.length" class="flex flex-col gap-4">
            <div class="flex flex-col gap-3">
              <div v-for="(signer, index) in doc.routingQueue" :key="signer.email" class="flex items-center gap-3 rounded-xl border border-dark-400 bg-dark-500/50 p-4">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semi-bold text-white"
                  :class="signer.status === 'COMPLETED' ? 'bg-success-500' : 'border border-dark-400 bg-dark-600'">
                  <span v-if="signer.status === 'COMPLETED'">✓</span>
                  <span v-else>{{ getInitials(signer.name) }}</span>
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="truncate text-base font-semi-bold text-white">{{ signer.name }}</p>
                  <p class="truncate text-sm text-light-400">{{ signer.email }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span class="text-xs font-semi-bold uppercase tracking-wider" :class="signer.status === 'SIGNED' ? 'text-success-500' : 'text-alert-500'">
                    {{ signer.status }}
                  </span>

                  <button
                    v-if="signer.status !== 'COMPLETED'"
                    :disabled="isGeneratingLink === signer.email"
                    class="flex items-center gap-1.5 rounded-lg border border-dark-400 bg-dark-600 px-3 py-1.5 text-[10px] font-semi-bold text-light-400 transition-colors hover:border-primary-500 hover:text-white disabled:opacity-50"
                    @click="generateSessionLink(signer.name, signer.email, index !== doc.routingQueue.length - 1)">
                    <NuxtIcon v-if="isGeneratingLink === signer.email" name="local:loader" class="animate-spin text-sm" />
                    <NuxtIcon v-else name="local:node" class="text-sm" />
                    Get Link
                  </button>
                </div>
              </div>
            </div>

            <div v-if="magicLink" class="animate-fade-in flex flex-col gap-2 pt-2">
              <h3 class="text-sm font-semi-bold text-success-500">Magic Link Generated ✓</h3>
              <div class="flex flex-col gap-3 rounded-xl border border-success-500/30 bg-success-500/10 p-4">
                <p class="text-xs leading-relaxed text-light-400">Share this secure magic link with the signer. The link expires in 60 minutes.</p>
                <input
                  readonly
                  :value="magicLink"
                  class="font-mono w-full rounded-lg border border-dark-400 bg-dark-600 px-3 py-2 text-xs text-white outline-none transition-colors focus:border-primary-500" />
                <div class="flex items-center gap-3 pt-1">
                  <button
                    class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dark-400 bg-dark-600 px-4 py-2 text-[11px] font-semi-bold uppercase tracking-wider text-white transition-colors hover:border-primary-500"
                    @click="copyLink">
                    <span v-if="isCopied" class="text-success-500">✓ Copied!</span>
                    <span v-else>Copy Link</span>
                  </button>

                  <a
                    :href="magicLink"
                    target="_blank"
                    class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-[11px] font-semi-bold uppercase tracking-wider text-white transition-transform hover:scale-105 hover:bg-primary-600 active:scale-95">
                    Open Link
                    <NuxtIcon name="local:chevron-bold" class="scale-x-[-1]" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col gap-4">
            <div v-if="!magicLink" class="flex flex-col gap-3">
              <div v-for="signer in envelopeSigners" :key="signer.order" class="flex flex-col gap-3 rounded-xl border border-dark-400 bg-dark-500/50 p-4">
                <h4 class="text-xs font-semi-bold uppercase tracking-wider text-light-500">Signer {{ signer.order }}</h4>
                <div class="flex flex-col gap-2">
                  <input
                    v-model="signer.name"
                    type="text"
                    placeholder="Full Name"
                    class="w-full rounded-lg border border-dark-400 bg-dark-600 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-primary-500" />
                  <input
                    v-model="signer.email"
                    type="email"
                    placeholder="Email Address"
                    class="w-full rounded-lg border border-dark-400 bg-dark-600 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-primary-500" />
                  <input
                    v-model="signer.role"
                    type="text"
                    placeholder="Role (e.g. Client, Contractor)"
                    class="w-full rounded-lg border border-dark-400 bg-dark-600 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-light-500/50 focus:border-primary-500" />
                </div>
              </div>
            </div>

            <div v-if="magicLink" class="animate-fade-in flex flex-col gap-2">
              <h3 class="text-sm font-semi-bold text-success-500">Envelope Sent ✓</h3>
              <div class="flex flex-col gap-3 rounded-xl border border-success-500/30 bg-success-500/10 p-4">
                <p class="text-xs leading-relaxed text-light-400">Share this secure magic link with the signer. The link expires in 7 days.</p>
                <input
                  readonly
                  :value="magicLink"
                  class="font-mono w-full rounded-lg border border-dark-400 bg-dark-600 px-3 py-2 text-xs text-white outline-none transition-colors focus:border-primary-500" />
                <div class="flex items-center gap-3 pt-1">
                  <button
                    class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dark-400 bg-dark-600 px-4 py-2 text-[11px] font-semi-bold uppercase tracking-wider text-white transition-colors hover:border-primary-500"
                    @click="copyLink">
                    <span v-if="isCopied" class="text-success-500">✓ Copied!</span>
                    <span v-else>Copy Link</span>
                  </button>

                  <a
                    :href="magicLink"
                    target="_blank"
                    class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-[11px] font-semi-bold uppercase tracking-wider text-white transition-transform hover:scale-105 hover:bg-primary-600 active:scale-95">
                    Open Link
                    <NuxtIcon name="local:chevron-bold" class="scale-x-[-1]" />
                  </a>
                </div>
              </div>
            </div>

            <div class="mt-2 flex flex-col gap-3">
              <button
                v-if="!magicLink"
                :disabled="isSendingEnvelope || !isEnvelopeValid"
                class="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semi-bold text-dark-500 transition-colors hover:bg-light-400 disabled:cursor-not-allowed disabled:opacity-60"
                @click="sendForSignature">
                <NuxtIcon v-if="isSendingEnvelope" name="local:loader" class="animate-spin text-lg" />
                {{ isSendingEnvelope ? 'Generating Envelope...' : 'Create Envelope & Get Link' }}
              </button>
            </div>
          </div>
        </div>

        <div class="h-px w-full bg-white/10" />

        <!-- Merged View: Timeline Section -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semi-bold text-white">Document History</h3>
          <div class="relative ml-2 mt-2 flex flex-col gap-8 border-l border-white/10 pb-4 pl-6">
            <div v-for="item in doc.timeline" :key="item.id" class="relative">
              <div class="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-primary-500 ring-[6px] ring-dark-500" />
              <div class="mb-2 flex items-center justify-between text-xs text-light-500">
                <span>{{ item.date }}</span>
                <span>{{ item.time }}</span>
              </div>
              <div class="flex items-start gap-3 text-sm text-white">
                <div class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semi-bold text-black">
                  {{ item.userInitials }}
                </div>
                <p class="leading-tight">
                  <span class="font-semi-bold">{{ item.userName }}</span> {{ item.action }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSidebar>
  </main>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}
</style>
