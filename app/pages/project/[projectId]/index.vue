<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string

const { data: project, pending } = await useFetch(`/api/project/${projectId}`)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formData = ref<Record<string, any>>({})
let isInitialized = false

watch(
  project,
  (val) => {
    if (val) {
      formData.value = JSON.parse(JSON.stringify(val))
      setTimeout(() => {
        isInitialized = true
      }, 200)
    }
  },
  { immediate: true }
)

const isSaving = ref(false)
const showSaved = ref(false)

async function saveChanges() {
  if (isSaving.value || !project.value) return
  isSaving.value = true
  showSaved.value = false
  try {
    await $fetch(`/api/project/${projectId}`, {
      method: 'PUT',
      body: formData.value,
    })
    showSaved.value = true
    setTimeout(() => {
      showSaved.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to update project', err)
  } finally {
    isSaving.value = false
  }
}

watchDebounced(
  formData,
  () => {
    if (isInitialized) saveChanges()
  },
  { deep: true, debounce: 1000, maxWait: 5000 }
)

const standardProps = computed(() => [
  { label: 'Index', key: 'index', readonly: true },
  { label: 'Slug', key: 'slug', readonly: true },
  { label: 'Status', key: 'status', schemaType: 'enum:Plan,Quotation,Shoot,Edit,Delivered' },
  { label: 'Segment', key: 'segment', schemaType: 'text' },
  { label: 'Quotation', key: 'quotation', schemaType: 'number' },
  { label: 'Address', key: 'address', schemaType: 'text' },
  { label: 'Place', key: 'place', schemaType: 'text' },
  { label: 'Date', key: 'date', schemaType: 'date' },
  { label: 'Duration', key: 'duration', schemaType: 'text' },
  { label: 'Budget', key: 'budget', schemaType: 'number' },
  { label: 'Contact', key: 'contactName', isRelation: true },
  { label: 'Organization', key: 'organizationName', isRelation: true },
])

const editorProps = computed(() => [
  { label: 'Description', key: 'description' },
  { label: 'Additional', key: 'additional' },
])
</script>

<template>
  <main class="flex size-full flex-col items-center overflow-y-auto bg-dark-400 text-white">
    <div v-if="pending" class="w-full max-w-4xl animate-pulse p-8 md:p-16">
      <div class="h-12 w-3/4 rounded-lg bg-white/5" />
      <div class="mt-12 flex flex-col gap-4">
        <div v-for="i in 8" :key="i" class="flex items-center gap-4">
          <div class="h-6 w-32 rounded bg-white/5" />
          <div class="h-6 w-64 rounded bg-white/5" />
        </div>
      </div>
    </div>

    <div v-else-if="project" class="w-full max-w-4xl p-2 md:p-4">
      <div class="mb-2 flex flex-col pb-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          v-model="formData.name"
          placeholder="Untitled Project"
          class="w-full bg-transparent text-2xl font-semi-bold tracking-tight text-white placeholder:text-light-600 focus:outline-none md:text-3xl" />
        <div class="flex shrink-0 items-center gap-2 text-xs font-semi-bold">
          <span v-if="isSaving" class="flex items-center gap-1.5 text-light-500"> <NuxtIcon name="local:loader" class="animate-spin text-sm" /> Syncing </span>
          <span v-else-if="showSaved" class="animate-fade-in flex items-center gap-1.5 text-success-500"> <NuxtIcon name="local:check" class="text-sm" /> Saved </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <template v-for="prop in standardProps" :key="prop.key">
          <div v-if="prop.readonly" class="group flex flex-col rounded-2xl border border-dark-400 bg-dark-500/50 p-5 shadow-sm transition-colors hover:border-dark-400">
            <h3 class="mb-1 text-lg font-semi-bold capitalize text-white">{{ prop.label }}</h3>
            <p class="mb-4 text-sm text-light-500">(Read-only field)</p>
            <div class="w-full rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 text-sm text-light-500 outline-none">
              {{ formData[prop.key] || 'Empty' }}
            </div>
          </div>

          <div v-else-if="prop.isRelation" class="group flex flex-col rounded-2xl border border-dark-400 bg-dark-500/50 p-5 shadow-sm transition-colors hover:border-dark-400">
            <h3 class="mb-1 text-lg font-semi-bold capitalize text-white">{{ prop.label }}</h3>
            <p class="mb-4 text-sm text-light-500">(Relational link)</p>
            <div
              class="flex w-full items-center gap-2 rounded-xl border border-dark-400 bg-dark-500 px-4 py-3 text-sm text-white outline-none transition-colors focus-within:border-white hover:bg-dark-400">
              <NuxtIcon name="local:file-document" class="shrink-0 text-sm text-light-500" />
              <input
                v-model="formData[prop.key]"
                class="w-full bg-transparent text-sm font-semi-bold underline decoration-white/20 underline-offset-4 placeholder:text-light-600 placeholder:opacity-60 hover:decoration-white/60 focus:outline-none"
                placeholder="Empty relation" />
            </div>
          </div>

          <FormField v-else v-model="formData[prop.key]" :label="prop.label" :schema-type="prop.schemaType" />
        </template>
      </div>

      <div class="mt-6 flex flex-col gap-6">
        <div v-for="prop in editorProps" :key="prop.key" class="group flex flex-col rounded-2xl border border-dark-400 bg-dark-500/50 p-5 shadow-sm transition-colors hover:border-dark-400">
          <h3 class="mb-1 text-lg font-semi-bold capitalize text-white">{{ prop.label }}</h3>
          <p class="mb-4 text-sm text-light-500">(Rich text content)</p>
          <div class="relative flex w-full flex-col rounded-xl border border-dark-400 bg-dark-500 px-4 py-3">
            <AppEditor v-model="formData[prop.key]" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex h-[50vh] flex-col items-center justify-center text-light-500">
      <NuxtIcon name="local:folder" class="mb-4 text-4xl opacity-50" />
      <p class="text-sm font-semi-bold">Project not found.</p>
    </div>
  </main>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
