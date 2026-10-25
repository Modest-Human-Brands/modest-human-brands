<script setup lang="ts">
const props = defineProps<{
  templateId: string
  site?: Site
}>()

const isEdit = !!props.site

const defaultBrand: SiteBrand = {
  name: '',
  logoUrl: '',
  faviconUrl: '',
  fontFamily: 'Oxanium',
  colors: { primary: '#FB3737', secondary: '#262626', accent: '#F24067', background: '#171717', text: '#F8FAFC' },
}

const slug = ref(props.site?.slug ?? '')
const brand = ref<SiteBrand>(structuredClone(toRaw(props.site?.brand ?? defaultBrand)))
const domains = ref((props.site?.domains ?? []).join('\n'))

const fields = [
  { path: 'name', label: 'Brand Name' },
  { path: 'logoUrl', label: 'Logo URL' },
  { path: 'faviconUrl', label: 'Favicon URL' },
  { path: 'fontFamily', label: 'Font Family' },
] as const
const colorKeys = ['primary', 'secondary', 'accent', 'background', 'text'] as const

const errors = ref<Record<string, string>>({})
const isSaving = ref(false)
const isDrawerOpen = ref(false)

const domainList = computed(() =>
  domains.value
    .split(/[\s,]+/)
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean)
)
const domainError = computed(() => Object.entries(errors.value).find(([field]) => field.startsWith('domains'))?.[1])

// Preview shows the stored payload when editing; a new site uses the template placeholders
const previewHtml = ref('')
const isPreviewLoading = ref(false)

const loadPreview = useDebounceFn(async () => {
  isPreviewLoading.value = true
  try {
    const res = await $fetch<{ html: string }>('/api/site/template/preview', {
      method: 'POST',
      body: { templateId: props.templateId, brand: brand.value, ...(props.site ? { data: props.site.data } : {}) },
    })
    previewHtml.value = res.html
  } catch {
    // An invalid colour or empty field is reported on save; keep the last good preview meanwhile
  } finally {
    isPreviewLoading.value = false
  }
}, 800)

watch(brand, loadPreview, { deep: true, immediate: true })

async function onSave() {
  isSaving.value = true
  errors.value = {}

  try {
    const body = { ...(isEdit ? {} : { slug: slug.value }), templateId: props.templateId, brand: brand.value, domains: domainList.value, ...(props.site ? { data: props.site.data } : {}) }
    const saved = await $fetch<Site>(isEdit ? `/api/site/${props.site!.slug}` : '/api/site', { method: isEdit ? 'PUT' : 'POST', body })

    await navigateTo(`/site/${saved.slug}`)
  } catch (error) {
    const { statusMessage, data } = (error as { data?: { statusMessage?: string; data?: { errors?: { field: string; message: string }[] } } }).data ?? {}
    const issues = data?.errors ?? []

    errors.value = issues.length ? Object.fromEntries(issues.map(({ field, message }) => [field, message])) : { form: statusMessage ?? 'Could not save the site' }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <main class="relative flex size-full flex-row overflow-hidden bg-dark-400">
    <div class="relative flex-1 bg-dark-500">
      <iframe :srcdoc="previewHtml" sandbox="" title="Site preview" class="size-full border-0 bg-white" :class="{ 'opacity-60': isPreviewLoading }" />
    </div>

    <AppSidebar v-model:open="isDrawerOpen" as-drawer-on-mobile>
      <template #header>
        <h1 class="text-xl font-semi-bold capitalize tracking-tight text-white">{{ isEdit ? site!.brand.name : templateId.replace(/-/g, ' ') }}</h1>
        <p class="my-1 mb-3 text-xs text-light-500">{{ isEdit ? 'Edit the brand and domains' : 'Fill details to update preview' }}</p>
      </template>

      <div class="flex flex-col gap-4">
        <FormField v-if="!isEdit" v-model="slug" label="Slug" schema-type="text" :error-message="errors.slug" />

        <FormField v-for="field in fields" :key="field.path" v-model="brand[field.path]" :label="field.label" schema-type="text" :error-message="errors[`brand.${field.path}`]" />

        <FormField v-for="key in colorKeys" :key="key" v-model="brand.colors[key]" :label="`${formatKeyToLabel(key)} Color`" schema-type="text" :error-message="errors[`brand.colors.${key}`]" />

        <FormField v-model="domains" label="Domains (one per line)" schema-type="textarea" :required="false" :error-message="domainError" />

        <p v-if="errors.form" class="text-error-500 text-sm">{{ errors.form }}</p>
      </div>

      <div class="flex items-center justify-end gap-3 border-t border-dark-500/50 py-6">
        <button
          type="button"
          :disabled="isSaving"
          class="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semi-bold text-dark-500 transition-colors hover:bg-light-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          @click="onSave">
          <NuxtIcon v-if="isSaving" name="local:loader" class="animate-spin text-lg" />
          {{ isSaving ? 'Saving...' : isEdit ? 'Save changes' : 'Create site' }}
        </button>
      </div>

      <template #actions>
        <NuxtLink :to="isEdit ? '/site' : '/site/new'" class="hidden size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:flex">
          <NuxtIcon name="local:cross" class="text-sm" />
        </NuxtLink>
        <button class="flex size-9 items-center justify-center rounded-lg bg-dark-500 text-light-400 transition-colors hover:text-white md:hidden" @click.stop="isDrawerOpen = !isDrawerOpen">
          <NuxtIcon name="local:chevron-bold" class="text-sm transition-transform duration-300" :class="isDrawerOpen ? '-rotate-90' : 'rotate-90'" />
        </button>
      </template>
    </AppSidebar>
  </main>
</template>
