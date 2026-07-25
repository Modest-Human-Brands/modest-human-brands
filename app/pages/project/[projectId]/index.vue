<script setup lang="ts">
import { watchDebounced, useClipboard } from '@vueuse/core'

definePageMeta({
  layout: false,
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

const { user } = useUserSession()
const { data: organizationData } = await useFetch(`/api/organization/${user.value?.organizations?.[0]}`)
const organization = computed(() => organizationData.value ?? { name: '', branding: { logo: '/logo.png' } })
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })
const editedAt = ref('Jan 17')

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

const { copy, copied } = useClipboard()

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
  <div class="flex h-screen w-screen items-start justify-start overflow-hidden bg-dark-400 font-main text-white">
    <LazyAppNavbar :organization-name="organization.name" :organization-logo="organization.branding.logo" active-key="project" hydrate-on-idle />

    <div class="relative isolate mx-auto flex h-screen w-full grow flex-col overflow-hidden">
      <header class="flex shrink-0 items-center justify-between border-b border-dark-600/40 px-4 py-4 md:px-8">
        <div class="flex items-center gap-4">
          <NuxtIcon name="local:target" class="text-4xl" />
          <div class="flex flex-col">
            <span class="w-full bg-transparent text-2xl font-semi-bold tracking-tight text-white placeholder:text-light-500 focus:outline-none md:text-3xl">
              {{ formData.title }}
            </span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-4">
          <div class="flex items-center gap-2 text-sm font-semi-bold">
            <span v-if="isSaving" class="flex items-center gap-2 fill-primary-400 text-primary-400">
              <NuxtIcon name="local:loader" class="text-lg" />
              Syncing...
            </span>
            <span v-else-if="showSaved" class="animate-fade-in flex items-center gap-2 fill-success-500 text-success-500">
              <NuxtIcon name="local:check" class="text-lg" />
              Saved
            </span>
          </div>
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators || []" />
        </div>
      </header>

      <div class="flex min-h-0 grow flex-col overflow-hidden lg:flex-row">
        <main class="scrollbar-hidden flex-1 space-y-6 overflow-y-auto p-4 md:p-8">
          <div v-if="pending" class="mx-auto max-w-4xl animate-pulse space-y-6">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div v-for="i in 8" :key="i" class="h-12 rounded-lg bg-dark-500" />
            </div>
            <div class="h-64 rounded-xl bg-dark-500" />
          </div>

          <div v-else class="mx-auto max-w-4xl space-y-6">
            <div class="grid grid-cols-2 gap-6 pb-4 md:grid-cols-4">
              <div class="flex flex-col gap-1">
                <span class="flex items-center gap-2 text-sm font-regular text-light-500">
                  <NuxtIcon name="local:grid" class="shrink-0 text-xl text-light-400" />
                  Index
                </span>
                <span class="pl-7 text-base font-semi-bold text-white">{{ formData.index || '0' }}</span>
              </div>

              <div class="flex flex-col gap-1">
                <span class="flex items-center gap-2 text-sm font-regular text-light-500">
                  <NuxtIcon name="local:grid" class="shrink-0 text-xl text-light-400" />
                  Slug
                </span>
                <button type="button" class="truncate pl-7 text-left text-base font-semi-bold text-white hover:text-primary-400" @click="copy(formData.slug)">
                  {{ formData.slug || 'untitled' }}
                  <span v-if="copied" class="ml-1 text-sm text-success-500">(Copied)</span>
                </button>
              </div>

              <div class="flex flex-col gap-1">
                <span class="flex items-center gap-2 text-sm font-regular text-light-500">
                  <NuxtIcon name="local:grid" class="shrink-0 text-xl text-light-400" />
                  Status
                </span>
                <div class="pl-7">
                  <span class="inline-flex items-center gap-2 rounded-full bg-dark-500 px-3 py-1 text-sm font-semi-bold text-white">
                    <span class="size-2 rounded-full bg-primary-500" />
                    {{ formData.status }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <span class="flex items-center gap-2 text-sm font-regular text-light-500">
                  <NuxtIcon name="local:grid" class="shrink-0 text-xl text-light-400" />
                  Segment
                </span>
                <input v-model="formData.segment" type="text" class="w-full bg-transparent pl-7 text-base font-semi-bold text-white focus:text-primary-400 focus:outline-none" />
              </div>
            </div>

            <div class="flex flex-col py-2">
              <div class="grid grid-cols-[140px_1fr] items-center gap-4 py-3 text-base md:grid-cols-[160px_1fr]">
                <span class="flex items-center gap-3 font-regular text-light-500">
                  <NuxtIcon name="local:grid" class="shrink-0 text-2xl text-light-400" />
                  Address
                </span>
                <input v-model="formData.shootLocation" type="text" class="w-full truncate bg-transparent font-regular text-white focus:text-primary-400 focus:outline-none" />
              </div>

              <div class="grid grid-cols-[140px_1fr] items-center gap-4 py-3 text-base md:grid-cols-[160px_1fr]">
                <span class="flex items-center gap-3 font-regular text-light-500">
                  <NuxtIcon name="local:calendar" class="shrink-0 text-2xl text-light-400" />
                  Date
                </span>
                <span class="font-regular text-white">{{ formatDateDisplay(formData.shootDate) }}</span>
              </div>

              <div class="grid grid-cols-[140px_1fr] items-center gap-4 py-3 text-base md:grid-cols-[160px_1fr]">
                <span class="flex items-center gap-3 font-regular text-light-500">
                  <NuxtIcon name="local:person" class="shrink-0 text-2xl text-light-400" />
                  Client
                </span>
                <span class="cursor-pointer font-regular text-white underline decoration-white/20 underline-offset-4 hover:decoration-white">
                  {{ formData.clientName }}
                </span>
              </div>

              <div class="grid grid-cols-[140px_1fr] items-center gap-4 py-3 text-base md:grid-cols-[160px_1fr]">
                <span class="flex items-center gap-3 font-regular text-light-500">
                  <NuxtIcon name="local:wallet" class="shrink-0 text-2xl text-light-400" />
                  Budget
                </span>
                <span class="font-regular text-white">{{ formatCurrency(formData.budget) }}</span>
              </div>
            </div>

            <ProjectScopeTable ref="scopeTableRef" v-model="formData.deliverables" :budget="formData.budget" />

            <div class="pt-6">
              <AppEditor v-model="formData.additional" class="w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
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
