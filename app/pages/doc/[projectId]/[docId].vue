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

const route = useRoute()
const projectId = route.params.projectId as string
const docId = route.params.docId as string

const { data: doc } = await useFetch<MDocDocument>(`/api/doc/${projectId}/${docId}`)

const isDrawerOpen = ref(false)

if (!doc.value?.templateId) throw createError({ status: 404, message: 'Template not found' })

function getInitials(name?: string) {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

const resendState = ref<Record<string, 'sent' | false>>({})

// Safe accessor — guards against a ref/value that isn't initialised so a
// signer whose email never resolved can't throw during render.
function getResendState(email: string) {
  const value = resendState.value
  return value ? value[email] || false : false
}

async function resendSession(signer: { name: string; email: string }, isContact: boolean) {
  try {
    await $fetch(`/api/doc/${projectId}/${docId}/session`, {
      method: 'POST',
      body: { signerName: signer.name, signerEmail: signer.email, signerIsContact: isContact },
    })
    const value = resendState.value
    if (value) {
      value[signer.email] = 'sent'
      setTimeout(() => {
        value[signer.email] = false
      }, 2500)
    }
  } catch (error) {
    console.error('Resend session failed:', error)
  }
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isDrawerOpen.value = false
  }
})
</script>

<template>
  <main v-if="doc" class="relative flex h-dvh w-screen flex-row overflow-hidden bg-dark-400">
    <PdfDocumentViewer ref="viewerRef" :src="doc.previewUrl" :doc="{ id: docId, name: doc.name, previewUrl: doc.previewUrl }" class="flex-1">
      <template #toolbar-actions>
        <button type="button" class="shrink-0 transition-colors hover:text-accent-500" :class="isDrawerOpen ? 'text-accent-500' : 'text-white'" @click="isDrawerOpen = true">
          <NuxtIcon name="local:signature" class="text-xl" />
        </button>
      </template>
    </PdfDocumentViewer>

    <AppSidebar v-model:open="isDrawerOpen" as-drawer-on-mobile>
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

        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semi-bold text-white">Status</h3>
            <span
              v-if="doc?.routingQueue?.length"
              class="rounded-full px-2 py-0.5 text-[10px] font-semi-bold uppercase tracking-wider"
              :class="{
                'bg-success-500/20 text-success-500': doc.status === 'Completed',
                'bg-accent-500/20 text-accent-500': doc.status === 'Signed',
                'bg-alert-500/20 text-alert-500': doc.status === 'Void',
              }">
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
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-dark-400 bg-dark-500/50 px-3 py-1.5 text-xs font-semi-bold text-light-500 transition-colors hover:text-white disabled:opacity-60"
                    :disabled="getResendState(signer.email) === 'sent'"
                    @click="resendSession(signer, index === 0)">
                    <NuxtIcon :name="getResendState(signer.email) === 'sent' ? 'local:check' : 'local:refresh'" :class="getResendState(signer.email) === 'sent' ? 'text-success-500' : ''" />
                    {{ getResendState(signer.email) === 'sent' ? 'Sent' : 'Resend' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="h-px w-full bg-white/10" />

        <!-- Merged View: Timeline Section -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semi-bold text-white">Timeline</h3>
          <div class="relative ml-2 mt-2 flex flex-col gap-8 border-l border-white/10 pb-4 pl-6">
            <div v-for="item in doc.timeline" :key="item.id" class="relative">
              <div class="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-accent-500 ring-[6px] ring-dark-500" />
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
