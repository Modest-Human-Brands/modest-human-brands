<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

interface ProjectDeliverable {
  id?: string
  title: string
  quantity?: number
  rate?: number
  description?: string
  points?: string[]
}

interface ProjectFormData {
  title: string
  index: number
  slug: string
  status: string
  segment: string
  shootLocation: string
  shootDate: string
  clientName: string
  budget: number
  deliverables: ProjectDeliverable[]
  additional: string | Record<string, unknown>
}

const route = useRoute()
const projectId = route.params.projectId as string

const { data: project, pending } = await useFetch(`/api/project/${projectId}`)

let lastSavedHash = ''
const formData = ref<ProjectFormData>({
  title: '',
  index: 0,
  slug: '',
  status: '',
  segment: '',
  shootLocation: '',
  shootDate: '',
  clientName: '',
  budget: 0,
  deliverables: [],
  additional: '',
})

let isInitialized = false

watch(
  project,
  (val) => {
    if (val) {
      formData.value = {
        title: val.title ?? '',
        index: val.index ?? 0,
        slug: val.slug ?? '',
        status: val.status ?? '',
        segment: val.segment ?? '',
        shootLocation: val.shootLocation ?? '',
        shootDate: val.shootDate ?? '',
        clientName: val.contactName ?? '',
        budget: val.budget ?? 0,
        deliverables: val.deliverables ?? [],
        additional: val.additional ?? '',
      }
      setTimeout(() => {
        isInitialized = true
      }, 200)
      lastSavedHash = JSON.stringify(formData.value)
    }
  },
  { immediate: true }
)

const scopeTableRef = ref<{ startAddingService: () => void } | null>(null)

const isSaving = ref(false)
const showSaved = ref(false)

async function saveChanges(): Promise<void> {
  if (isSaving.value || !isInitialized) return

  const currentHash = JSON.stringify(formData.value)
  if (currentHash === lastSavedHash) return

  isSaving.value = true
  showSaved.value = false
  try {
    const res = await $fetch<ProjectFormData>(`/api/project/${projectId}`, {
      method: 'PUT',
      body: formData.value,
    })
    if (res && res.deliverables) {
      formData.value.deliverables = res.deliverables
    }
    lastSavedHash = JSON.stringify(formData.value)
    showSaved.value = true
    setTimeout(() => {
      showSaved.value = false
    }, 3000)
  } catch (err) {
    console.error('[Frontend Autosave ERROR]: Failed to sync project modifications:', err)
  } finally {
    isSaving.value = false
  }
}

watchDebounced(
  formData,
  () => {
    if (isInitialized) {
      saveChanges()
    }
  },
  { deep: true, debounce: 800, maxWait: 4000 }
)

function formatCurrency(amount: number | string | undefined): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '0'
  return new Intl.NumberFormat('en-IN').format(Number(amount))
}

function formatDateDisplay(dateStr: string | undefined): string {
  if (!dateStr) return 'Not configured'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}
</script>

<template>
  <div class="flex min-h-0 grow flex-col overflow-hidden lg:flex-row">
    <section class="scrollbar-hidden flex-1 space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-8">
      <div v-if="pending" class="mx-auto max-w-4xl animate-pulse space-y-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div v-for="i in 8" :key="i" class="h-12 rounded-lg bg-dark-500" />
        </div>
        <div class="h-64 rounded-xl bg-dark-500" />
      </div>

      <div v-else class="mx-auto max-w-4xl space-y-6">
        <div class="-mx-4 md:-mx-8">
          <ProjectMetaRow :index="formData.index" :slug="formData.slug" :status="formData.status" :segment="formData.segment" />
        </div>

        <div class="flex flex-col fill-light-500 text-white">
          <div class="grid grid-cols-[107px_1fr] items-center gap-4 py-2.5 text-base">
            <span class="flex items-center gap-2">
              <NuxtIcon name="local:grip" class="shrink-0 text-[24px]" />
              Address
            </span>
            <input v-model="formData.shootLocation" type="text" class="w-full truncate bg-transparent focus:text-accent-400 focus:outline-none" />
          </div>

          <div class="grid grid-cols-[107px_1fr] items-center gap-4 py-2.5 text-base">
            <span class="flex items-center gap-2">
              <NuxtIcon name="local:calendar" class="shrink-0 text-[24px]" />
              Date
            </span>
            <span>{{ formatDateDisplay(formData.shootDate) }}</span>
          </div>

          <div class="grid grid-cols-[107px_1fr] items-center gap-4 py-2.5 text-base">
            <span class="flex items-center gap-2">
              <NuxtIcon name="local:person" class="shrink-0 text-[24px]" />
              Client
            </span>
            <span>{{ formData.clientName }}</span>
          </div>

          <div class="grid grid-cols-[107px_1fr] items-center gap-4 py-2.5 text-base">
            <span class="flex items-center gap-2">
              <NuxtIcon name="local:wallet" class="shrink-0 text-[24px]" />
              Budget
            </span>
            <span>{{ formatCurrency(formData.budget) }}</span>
          </div>
        </div>

        <ProjectScopeTable ref="scopeTableRef" v-model="formData.deliverables" :budget="formData.budget" />

        <AppEditor v-model="formData.additional" class="w-full" />
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.25s ease-out forwards;
}
</style>
