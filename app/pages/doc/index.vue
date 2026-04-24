<script setup lang="ts">
import type { LayoutAction } from '~/components/AppActionbar.vue'

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const config = useRuntimeConfig()
const router = useRouter()

const { data: documents, pending } = await useFetch<
  {
    id: string
    template: string
    label: string
    fileName: string
    createdAt: string
  }[]
>('/api/document', {
  baseURL: config.public.docUrl,
})
// const orgSlug = 'red-cat-pictures'

const folderSummaries = [
  { title: 'Quotation', docCount: 0, folderCount: 0, icon: 'local:folder' },
  { title: 'Internship Certificate', docCount: 0, folderCount: 0, icon: 'local:folder' },
]

const { bus } = inject('layout-actions') as { bus: Ref<LayoutAction> }
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
        break
      default:
        console.warn(`Unhandled action: ${name}`)
    }
  }
)

function handleCreate(payload?: { type: string; source: string }) {
  if (payload?.type === 'doc') {
    router.push('/doc/template')
  }
}
</script>

<template>
  <section class="h-full overflow-y-auto p-2 md:p-4">
    <!-- Loading skeleton -->
    <div v-if="pending" class="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 4" :key="i" class="aspect-[4/5] animate-pulse rounded-sm bg-dark-500" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!documents?.length" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p class="text-2xl font-light text-white">No Projects Found</p>
      <p class="mt-3 text-sm uppercase tracking-widest text-light-500">Create document to get started</p>
    </div>

    <!-- Collections grid -->
    <template v-else>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <CardDocFolder v-for="folder in folderSummaries" :key="folder.title" v-bind="folder" />
      </div>
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-dark-600 py-4">
          <div class="flex gap-2">
            <button class="font-medium rounded-md bg-dark-600 px-3 py-1.5 text-base text-white ring-1 ring-dark-500">All ({{ documents?.length }})</button>
            <button class="font-medium px-3 py-1.5 text-base text-light-600 hover:text-white">Pending</button>
            <button class="font-medium px-3 py-1.5 text-base text-light-600 hover:text-white">Draft</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-center text-sm">
            <thead class="whitespace-nowrap border-b border-dark-600 text-base uppercase text-light-600">
              <tr>
                <th class="font-medium px-2 py-1 md:px-6 md:py-4">Created</th>
                <th class="font-medium px-2 py-1 md:px-6 md:py-4">Document Title</th>
                <th class="font-medium px-2 py-1 md:px-6 md:py-4">Template</th>
                <th class="font-medium px-2 py-1 md:px-6 md:py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-600">
              <tr v-for="doc in documents" :key="doc.id" class="group cursor-pointer transition-colors hover:bg-dark-600/40" @click="router.push(`/doc/${doc.id}`)">
                <td class="whitespace-nowrap px-2 py-1 text-light-500 md:px-6 md:py-4">
                  <NuxtTime :datetime="doc.createdAt" class="text-base" day="numeric" month="short" year="numeric" :hour12="true" hour="2-digit" minute="2-digit" />
                </td>

                <td class="px-2 py-1 md:px-6 md:py-4">
                  <div class="flex flex-col">
                    <span class="font-medium text-white">{{ doc.fileName }}</span>
                    <!-- <span class="text-sm text-light-600 font-mono opacity-50">{{ doc.label }}</span> -->
                  </div>
                </td>

                <td class="px-2 py-1 md:px-6 md:py-4">
                  <span
                    class="font-medium inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-center text-sm capitalize tracking-tighter text-primary-400 ring-1 ring-inset ring-primary-400/20">
                    {{ doc.template.replace(/-/g, ' ') }}
                  </span>
                </td>

                <td class="px-2 py-1 md:px-6 md:py-4">
                  <div class="mx-auto flex w-fit items-center gap-1.5 text-success-400">
                    <span class="size-1.5 animate-pulse rounded-full bg-success-500"></span>
                    <span class="font-medium text-base">Success</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>
