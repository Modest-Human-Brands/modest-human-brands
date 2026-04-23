<script setup lang="ts">
import type { LayoutAction } from '~/components/AppActionbar.vue'

const { bus } = inject('layout-actions') as { bus: Ref<LayoutAction> }

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const config = useRuntimeConfig()
const router = useRouter()

const { data, status } = useFetch<{
  total: number
  documents: {
    id: string
    template: string
    label: string
    fileName: string
    createdAt: string
  }[]
}>('/api/document', {
  baseURL: config.public.docUrl,
})

onMounted(() => {
  console.log({ data: data })
})

const folderSummaries = [
  { title: 'Quotation', docCount: 14, folderCount: 0, icon: 'local:folder' },
  { title: 'Offer Letter', docCount: 14, folderCount: 0, icon: 'local:folder' },
]

watch(
  () => bus.value.timestamp,
  () => {
    const { name, payload } = bus.value

    if (!name) return

    switch (name) {
      case 'create':
        handleCreate(payload)
        break
      case 'export':
        console.log('Exporting data with filter:', payload.filter)
        break
      default:
        console.warn(`Unhandled action: ${name}`)
    }
  }
)

function handleCreate(payload: { type: string; source: string }) {
  if (payload.type === 'doc') {
    router.push('/doc/generate')
  }
}
</script>

<template>
  <main class="flex h-full w-full flex-col gap-8 overflow-y-auto p-6 md:p-10">
    <section class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      <CardDocFolder v-for="folder in folderSummaries" :key="folder.title" v-bind="folder" />
    </section>

    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-dark-600 pb-4">
        <div class="flex gap-2">
          <button class="font-medium rounded-md bg-dark-600 px-3 py-1.5 text-xs text-white ring-1 ring-dark-500">All</button>
          <button class="font-medium px-3 py-1.5 text-xs text-light-600 hover:text-white">Pending</button>
          <button class="font-medium px-3 py-1.5 text-xs text-light-600 hover:text-white">Draft</button>
        </div>
      </div>
      <div class="overflow-hidden rounded-xl bg-dark-500 ring-1 ring-dark-600">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-dark-600 bg-dark-600/30 text-xs uppercase text-light-600">
            <tr>
              <th class="font-medium px-6 py-4">Created</th>
              <th class="font-medium px-6 py-4">Document Title</th>
              <th class="font-medium px-6 py-4">Template</th>
              <th class="font-medium px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-600">
            <tr v-if="status === 'pending'" class="animate-pulse">
              <td colspan="4" class="px-6 py-10 text-center text-light-600">Loading documents...</td>
            </tr>

            <tr v-else-if="!data || !data.documents?.length">
              <td colspan="4" class="px-6 py-10 text-center text-light-600">No documents found. Start by creating one.</td>
            </tr>

            <tr v-for="doc in data?.documents" :key="doc.id" class="group cursor-pointer transition-colors hover:bg-dark-600/40" @click="router.push(`/doc/${doc.id}`)">
              <td class="whitespace-nowrap px-6 py-4 text-light-500">
                {{ new Date(doc.createdAt).toLocaleDateString() }}
                <span class="ml-1 text-2xs opacity-40">{{
                  new Date(doc.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}</span>
              </td>

              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-medium text-white">{{ doc.fileName }}</span>
                  <!-- <span class="text-2xs text-light-600 font-mono opacity-50">{{ doc.label }}</span> -->
                </div>
              </td>

              <td class="px-6 py-4">
                <span class="font-medium inline-flex items-center rounded-md bg-dark-600 px-2 py-1 text-2xs uppercase tracking-tighter text-primary-400 ring-1 ring-inset ring-primary-400/20">
                  {{ doc.template.replace(/-/g, ' ') }}
                </span>
              </td>

              <td class="px-6 py-4">
                <span class="flex items-center gap-1.5 text-success-400">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-success-500"></span>
                  <span class="font-medium text-xs">Success</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-2 text-xs text-light-600">
        <p>Showing {{ data?.documents.length }} results.</p>
      </div>
    </section>
  </main>
</template>
