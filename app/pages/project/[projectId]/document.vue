<script setup lang="ts">
import type { DocumentItem, DocumentStatus } from '~/components/CardDocument.vue'

definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string

interface DocumentColumn {
  id: DocumentStatus
  label: string
}

const config = useRuntimeConfig()

const defaultPreviewUrl = `${config.public.docUrl}/api/document/3ddee3b0-289a-8192-a475-e1f4deeaaec1/content?type=image`

// Placeholder data — hardcoded for now, replace with a useFetch(`/api/project/${projectId}/document`) call when the API is ready.
const columns = ref<DocumentColumn[]>([
  { id: 'draft', label: 'Draft' },
  { id: 'ready', label: 'Ready' },
  { id: 'sent', label: 'Sent' },
  { id: 'partially-signed', label: 'Partially Signed' },
  { id: 'completed', label: 'Completed' },
  { id: 'void', label: 'Void' },
])

const documents = ref<DocumentItem[]>([
  {
    id: '1',
    docNumber: '#1',
    fileType: 'PDF',
    title: 'Contract Agreement',
    description: 'The formal agreement or legal document associated with this record.',
    status: 'draft',
    updatedAgo: '2h ago',
    pages: 5,
    sizeMb: 1.5,
    contractTitle: 'Contractor Agreement',
    contractSubtitle: 'Project Photography and Videography',
    orgName: 'RED CAT PICTURES',
    orgSubtitle: 'Trading as MODEST HUMAN BRANDS LLP (Formerly GOLD FISH TALENTS LLP)',
    address: '17, Netaji Subhash Road, Beltala, P.O:- Harinavi SO, P.S:- Sonarpur, District:- South 24 Parganas, Pincode:- 700148 in ward no. 23',
    issuedDate: '18 Jul 2026',
    expiryDate: '25 Jul 2026',
    collaborators: [
      { id: 'u1', name: 'Aratrik Nandy' },
      { id: 'u2', name: 'Rumeo Saha' },
    ],
    previewUrl: defaultPreviewUrl,
    shareUrl: '',
  },
  {
    id: '213',
    docNumber: '#213',
    fileType: 'PDF',
    title: 'Contract Agreement',
    description: 'The formal agreement or legal document associated with this record.',
    status: 'ready',
    updatedAgo: '2h ago',
    pages: 5,
    sizeMb: 1.5,
    contractTitle: 'Contractor Agreement',
    contractSubtitle: 'Project Photography and Videography',
    orgName: 'RED CAT PICTURES',
    orgSubtitle: 'Trading as MODEST HUMAN BRANDS LLP (Formerly GOLD FISH TALENTS LLP)',
    address: '17, Netaji Subhash Road, Beltala, P.O:- Harinavi SO, P.S:- Sonarpur, District:- South 24 Parganas, Pincode:- 700148 in ward no. 23',
    issuedDate: '18 Jul 2026',
    expiryDate: '25 Jul 2026',
    collaborators: [
      { id: 'u1', name: 'Aratrik Nandy' },
      { id: 'u2', name: 'Rumeo Saha' },
    ],
    previewUrl: defaultPreviewUrl,
    shareUrl: '',
  },
  {
    id: '212',
    docNumber: '#212',
    fileType: 'PDF',
    title: 'Contract Agreement',
    description: 'The formal agreement or legal document associated with this record.',
    status: 'ready',
    updatedAgo: '3h ago',
    pages: 5,
    sizeMb: 1.8,
    contractTitle: 'Contractor Agreement',
    contractSubtitle: 'Project Photography and Videography',
    orgName: 'RED CAT PICTURES',
    orgSubtitle: 'Trading as MODEST HUMAN BRANDS LLP (Formerly GOLD FISH TALENTS LLP)',
    address: '17, Netaji Subhash Road, Beltala, P.O:- Harinavi SO, P.S:- Sonarpur, District:- South 24 Parganas, Pincode:- 700148 in ward no. 23',
    issuedDate: '18 Jul 2026',
    expiryDate: '25 Jul 2026',
    collaborators: [{ id: 'u1', name: 'Aratrik Nandy' }],
    previewUrl: defaultPreviewUrl,
    shareUrl: '',
  },
  {
    id: '211',
    docNumber: '#211',
    fileType: 'PDF',
    title: 'Contract Agreement',
    description: 'The formal agreement or legal document associated with this record.',
    status: 'sent',
    updatedAgo: '10h ago',
    pages: 5,
    sizeMb: 1.7,
    contractTitle: 'Contractor Agreement',
    contractSubtitle: 'Project Photography and Videography',
    orgName: 'RED CAT PICTURES',
    orgSubtitle: 'Trading as MODEST HUMAN BRANDS LLP (Formerly GOLD FISH TALENTS LLP)',
    address: '17, Netaji Subhash Road, Beltala, P.O:- Harinavi SO, P.S:- Sonarpur, District:- South 24 Parganas, Pincode:- 700148 in ward no. 23',
    issuedDate: '18 Jul 2026',
    expiryDate: '25 Jul 2026',
    collaborators: [
      { id: 'u1', name: 'Aratrik Nandy' },
      { id: 'u2', name: 'Rumeo Saha' },
    ],
    previewUrl: defaultPreviewUrl,
    shareUrl: '',
  },
])

const pending = ref(false)

function documentsFor(status: DocumentStatus): DocumentItem[] {
  return documents.value.filter((doc) => doc.status === status)
}

function addDocument(status: DocumentStatus): void {
  const id = `${Date.now()}`
  documents.value.push({
    id,
    docNumber: `#${id.slice(-3)}`,
    fileType: 'PDF',
    title: 'Untitled Document',
    description: 'The formal agreement or legal document associated with this record.',
    status,
    updatedAgo: 'Just now',
    pages: 0,
    sizeMb: 0,
    contractTitle: 'New Agreement',
    contractSubtitle: '',
    orgName: '',
    orgSubtitle: '',
    address: '',
    issuedDate: '',
    expiryDate: '',
    collaborators: [],
    previewUrl: defaultPreviewUrl,
    shareUrl: '',
  })
}
</script>

<template>
  <div class="flex min-h-0 grow flex-col overflow-hidden">
    <section class="scrollbar-hidden flex min-h-0 grow gap-4 overflow-x-auto p-4 md:gap-6 md:p-8">
      <div v-if="pending" class="flex gap-4 md:gap-6">
        <div v-for="i in 3" :key="i" class="h-80 w-72 shrink-0 animate-pulse rounded-xl bg-dark-500 md:w-80" />
      </div>

      <template v-else>
        <div v-for="column in columns" :key="column.id" class="flex w-72 shrink-0 flex-col gap-4 md:w-80">
          <div class="flex items-center justify-between rounded-full bg-dark-500 fill-light-500 px-2 py-1.5 text-light-500">
            <span class="flex items-center gap-2 pl-1">
              <NuxtIcon name="ph:dots-six-vertical" class="shrink-0 text-lg" />
              <span class="inline-flex items-center gap-2 rounded-full bg-info-600/40 px-3 py-1 text-sm font-semi-bold text-info-400">
                <span class="size-2 rounded-full bg-info-400" />
                {{ column.label }}
              </span>
            </span>
            <span class="flex items-center gap-1">
              <button type="button" class="rounded-full p-1.5 hover:bg-dark-600 hover:text-white">
                <NuxtIcon name="ph:dots-three" class="shrink-0 text-lg" />
              </button>
              <button type="button" class="rounded-full bg-dark-600 p-1.5 hover:bg-dark-400 hover:text-white" @click="addDocument(column.id)">
                <NuxtIcon name="ph:plus" class="shrink-0 text-lg" />
              </button>
            </span>
          </div>

          <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-4 overflow-y-auto pb-4">
            <CardDocument v-for="doc in documentsFor(column.id)" :key="doc.id" :document="doc" :project-id="projectId" />
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
