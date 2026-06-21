<script setup lang="ts">
import { VuePDF } from '@tato30/vue-pdf'

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
}

const route = useRoute()
const config = useRuntimeConfig()
const projectId = route.params.projectId as string
const docId = route.params.docId as string

const { data: doc, refresh } = await useFetch<MDocDocument>(`/api/doc/${projectId}/${docId}`)
const pdfUrl = computed(() => (!doc.value ? '' : `${config.public.docUrl}${doc.value.previewUrl}`))

const viewerRef = ref()

const isLeftOpen = ref(false)
const isRightDrawerOpen = ref(false)
const rightPanelView = ref<'metadata' | 'sign'>('metadata')

const isSendingEnvelope = ref(false)
const magicLink = ref('')
const isGeneratingLink = ref<string | null>(null)
const isCopied = ref(false)

function resetClick() {
  isLeftOpen.value = false
}

function getInitials(name?: string) {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

async function sendForSignature() {
  isSendingEnvelope.value = true
  try {
    const signerEmail = doc.value?.project?.contact?.email
    const signerName = doc.value?.project?.contact?.name || 'Primary Signer'

    await $fetch(`/api/doc/${projectId}/${docId}/envelope`, {
      method: 'POST',
      body: {
        expiresInDays: 7,
        routingType: 'SEQUENTIAL',
        signers: [{ order: 1, name: signerName, email: signerEmail, role: 'Client' }],
      },
    })

    // const res = await $fetch<{
    //   signer: string;
    //   expiresAt: string;
    //   token: string;
    //   magicLink: string;
    // }>(`/api/doc/${projectId}/${docId}/session`, {
    //   method: 'POST',
    //   body: { signerEmail, expiresInMinutes: 10080 }
    // })

    // magicLink.value = `/doc/${projectId}/${res.magicLink}`

    await refresh()
  } catch (error) {
    console.error('Failed to create envelope:', error)
  } finally {
    isSendingEnvelope.value = false
  }
}

async function generateSessionLink(signerEmail: string) {
  isGeneratingLink.value = signerEmail
  try {
    const res = await $fetch(`/api/doc/${projectId}/${docId}/session`, {
      method: 'POST',
      body: { signerEmail, expiresInMinutes: 60 }, // Requested 60 mins expiry
    })

    magicLink.value = `/doc/${projectId}${res.magicLink}`
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
</script>

<template>
  <main v-if="doc" class="relative flex h-dvh w-full flex-row overflow-hidden bg-dark-500">
    <div v-if="isLeftOpen" class="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden" @click="resetClick" />
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

    <PdfDocumentViewer ref="viewerRef" :src="pdfUrl" :doc="{ id: docId, name: doc.name, previewUrl: doc.previewUrl }">
      <template #toolbar-actions>
        <button
          class="font-semibold flex shrink-0 items-center gap-1.5 rounded-full bg-primary-500 px-4 py-1.5 text-xs text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          @click="
            rightPanelView = 'sign'
            isRightDrawerOpen = true
          ">
          <NuxtIcon name="local:pen" class="text-sm" /> Sign
        </button>
      </template>

      <template #floating-actions>
        <button class="absolute left-0 top-1/2 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg bg-black/80 text-white lg:hidden" @click="isLeftOpen = true">
          <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-xs" />
        </button>
      </template>
    </PdfDocumentViewer>

    <BaseDrawerSidebar v-model="isRightDrawerOpen">
      <template #header>
        <div v-if="rightPanelView === 'metadata'">
          <h2 class="text-xl font-bold tracking-tight text-white">Document Info</h2>
          <p class="mt-0.5 text-xs text-light-500">Metadata and history</p>
        </div>
        <div v-else>
          <h2 class="text-xl font-bold capitalize tracking-tight text-white">
            {{ doc?.routingQueue?.length ? 'Envelope Details' : 'Send to Sign' }}
          </h2>
          <p class="mt-0.5 text-xs text-light-500">
            {{ doc?.routingQueue?.length ? 'Track signer progress' : 'Lock document and prepare envelope' }}
          </p>
        </div>
      </template>

      <template #actions>
        <button
          v-if="rightPanelView === 'sign'"
          class="mr-2 flex items-center gap-2 rounded-lg bg-dark-500 px-3 py-1.5 text-xs font-bold text-light-400 transition-colors hover:text-white"
          @click="rightPanelView = 'metadata'">
          Back
        </button>
        <button class="flex size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white" @click="isRightDrawerOpen = false">
          <NuxtIcon name="local:cross" class="hidden text-sm md:block" />
          <NuxtIcon name="local:chevron-bold" class="rotate-90 text-sm md:hidden" />
        </button>
      </template>

      <div v-if="rightPanelView === 'metadata'" class="animate-fade-in flex flex-col gap-6">
        <div class="mb-6 flex w-full justify-center">
          <NuxtIcon :name="`local:file-${doc.extension}`" class="text-[200px]" />
        </div>

        <div class="flex flex-col gap-5">
          <div>
            <h4 class="mb-1 text-xs text-light-500">File Name</h4>
            <p class="text-sm text-white">{{ doc.name }}</p>
          </div>
          <div>
            <h4 class="mb-1 text-xs text-light-500">Size</h4>
            <p class="text-sm text-white">{{ doc.formattedSize }}</p>
          </div>
        </div>

        <div class="my-6 h-px w-full shrink-0 bg-white/10"></div>

        <div class="relative ml-2 flex flex-col gap-8 border-l border-white/10 pb-8 pl-6">
          <div v-for="item in doc.timeline" :key="item.id" class="relative">
            <div class="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full bg-primary-500 ring-[6px] ring-dark-500" />
            <div class="mb-2 flex items-center justify-between text-xs text-light-500">
              <span>{{ item.date }}</span>
              <span>{{ item.time }}</span>
            </div>
            <div class="flex items-start gap-3 text-sm text-white">
              <div class="font-semibold mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] text-black">
                {{ item.userInitials }}
              </div>
              <p class="leading-tight">
                <span class="font-semibold">{{ item.userName }}</span> {{ item.action }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="animate-fade-in flex flex-col gap-6">
        <div v-if="doc?.routingQueue?.length" class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-sm text-white">Signer Queue</h3>
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                :class="doc.status === 'Completed' ? 'bg-success-500/20 text-success-500' : 'bg-primary-500/20 text-primary-500'">
                {{ doc.status }}
              </span>
            </div>

            <div class="mt-1 flex flex-col gap-3">
              <div v-for="signer in doc.routingQueue" :key="signer.email" class="flex items-center gap-3 rounded-xl border border-dark-400 bg-dark-500/50 p-4">
                <div
                  class="font-semibold flex size-10 shrink-0 items-center justify-center rounded-full text-sm text-white"
                  :class="signer.status === 'COMPLETED' ? 'bg-success-500' : 'border border-dark-400 bg-dark-600'">
                  <span v-if="signer.status === 'COMPLETED'">✓</span>
                  <span v-else>{{ getInitials(signer.name) }}</span>
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="font-semibold truncate text-sm text-white">{{ signer.name }}</p>
                  <p class="truncate text-xs text-light-400">{{ signer.email }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider" :class="signer.status === 'COMPLETED' ? 'text-success-500' : 'text-alert-500'">
                    {{ signer.status }}
                  </span>

                  <button
                    v-if="signer.status !== 'COMPLETED'"
                    :disabled="isGeneratingLink === signer.email"
                    class="flex items-center gap-1.5 rounded-lg border border-dark-400 bg-dark-600 px-3 py-1.5 text-[10px] font-bold text-light-400 transition-colors hover:border-primary-500 hover:text-white disabled:opacity-50"
                    @click="generateSessionLink(signer.email)">
                    <NuxtIcon v-if="isGeneratingLink === signer.email" name="local:loader" class="animate-spin text-sm" />
                    <NuxtIcon v-else name="local:connect" class="text-sm" />
                    Get Link
                  </button>
                </div>
              </div>
            </div>

            <div v-if="magicLink" class="animate-fade-in mt-4 flex flex-col gap-2">
              <h3 class="font-semibold text-sm text-success-500">Magic Link Generated ✓</h3>
              <div class="flex flex-col gap-3 rounded-xl border border-success-500/30 bg-success-500/10 p-4">
                <p class="text-xs leading-relaxed text-light-400">Share this secure magic link with the signer. The link expires in 60 minutes.</p>
                <input
                  readonly
                  :value="magicLink"
                  class="font-mono w-full rounded-lg border border-dark-400 bg-dark-600 px-3 py-2 text-xs text-white outline-none transition-colors focus:border-primary-500" />
                <div class="flex items-center gap-3 pt-1">
                  <button
                    class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dark-400 bg-dark-600 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-primary-500"
                    @click="copyLink">
                    <span v-if="isCopied" class="text-success-500">✓ Copied!</span>
                    <span v-else>Copy Link</span>
                  </button>

                  <a
                    :href="magicLink"
                    target="_blank"
                    class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-transform hover:scale-105 hover:bg-primary-600 active:scale-95">
                    Open Link
                    <NuxtIcon name="local:chevron-bold" class="scale-x-[-1]" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <h3 class="font-semibold text-sm text-white">Signer</h3>
            <div class="mt-1 flex items-center gap-3 rounded-xl border border-dark-400 bg-dark-500/50 p-4">
              <div class="font-semibold flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm text-white">
                {{ getInitials(doc.project?.contact?.name) }}
              </div>
              <div class="overflow-hidden">
                <p class="font-semibold truncate text-sm text-white">
                  {{ doc.project?.contact?.name || 'No Contact Assigned' }}
                </p>
                <p class="truncate text-xs text-light-400">{{ doc.project?.contact?.email || 'No email available' }}</p>
              </div>
            </div>
          </div>

          <div v-if="magicLink" class="animate-fade-in flex flex-col gap-2">
            <h3 class="font-semibold text-sm text-success-500">Envelope Sent ✓</h3>
            <div class="flex flex-col gap-3 rounded-xl border border-success-500/30 bg-success-500/10 p-4">
              <p class="text-xs leading-relaxed text-light-400">Share this secure magic link with the signer. The link expires in 7 days.</p>
              <input
                readonly
                :value="magicLink"
                class="font-mono w-full rounded-lg border border-dark-400 bg-dark-600 px-3 py-2 text-xs text-white outline-none transition-colors focus:border-primary-500" />
              <div class="flex items-center gap-3 pt-1">
                <button
                  class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dark-400 bg-dark-600 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-primary-500"
                  @click="copyLink">
                  <span v-if="isCopied" class="text-success-500">✓ Copied!</span>
                  <span v-else>Copy Link</span>
                </button>

                <a
                  :href="magicLink"
                  target="_blank"
                  class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-transform hover:scale-105 hover:bg-primary-600 active:scale-95">
                  Open Link
                  <NuxtIcon name="local:chevron-bold" class="scale-x-[-1]" />
                </a>
              </div>
            </div>
          </div>

          <div class="mt-8 flex flex-col gap-3 border-t border-dark-500/50 pt-6">
            <button
              v-if="!magicLink"
              :disabled="isSendingEnvelope"
              class="font-semibold flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm text-dark-500 transition-colors hover:bg-light-400 disabled:opacity-60"
              @click="sendForSignature">
              <NuxtIcon v-if="isSendingEnvelope" name="local:loader" class="animate-spin text-lg" />
              {{ isSendingEnvelope ? 'Generating Envelope...' : 'Create Envelope & Get Link' }}
            </button>
            <button
              v-else
              class="font-semibold flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm text-dark-500 transition-colors hover:bg-light-400"
              @click="isRightDrawerOpen = false">
              Done
            </button>
          </div>
        </div>
      </div>
    </BaseDrawerSidebar>
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
