<script setup lang="ts">
const props = defineProps<{
  templateId: string
  site?: Site
}>()

const isEdit = !!props.site
const config = useRuntimeConfig()
const route = useRoute()

// MWap has no draft state: a saved site is live at once, for anyone, at its slug (and on its own domain)
const liveUrl = computed(() => (props.site ? `${config.public.wapUrl}/${props.site.slug}` : ''))
const customUrl = computed(() => (props.site?.domains?.[0] ? `https://${props.site.domains[0]}` : ''))
const notice = ref(route.query.created ? 'Site created and live.' : '')

// MWap rejects an incomplete brand (400), so a new site starts from valid placeholders the user then replaces
const defaultBrand: SiteBrand = {
  name: 'My Brand',
  logoUrl: 'https://api.iconify.design/lucide/aperture.svg?color=%23FB3737&width=64&height=64',
  faviconUrl: 'https://api.iconify.design/lucide/aperture.svg?color=%23FB3737',
  fontFamily: 'Oxanium',
  colors: { primary: '#FB3737', secondary: '#262626', accent: '#F24067', background: '#171717', text: '#F8FAFC' },
}

const { data: template } = await useFetch<SiteTemplateDetail>(`/api/site/template/${props.templateId}`)

const slug = ref(props.site?.slug ?? '')
const brand = ref<SiteBrand>(structuredClone(toRaw(props.site?.brand ?? defaultBrand)))
const domains = ref((props.site?.domains ?? []).join('\n'))
// Page content: the stored payload when editing, the template's complete sample for a new site
const content = ref<Record<string, unknown>>(structuredClone(toRaw(props.site?.data ?? template.value?.sample ?? {})))

// The layout is fixed, so content is edited slot by slot: a page's own title and description, then each of its sections
const groups = computed(() => {
  const pages = (content.value.pages ?? {}) as Record<string, Record<string, unknown>>

  return [
    { label: 'SEO', paths: [['seo']] },
    { label: 'Navigation', paths: [['navigation']] },
    ...Object.entries(pages).flatMap(([page, slots]) => [
      {
        label: `${formatKeyToLabel(page)} › Page`,
        paths: Object.keys(slots)
          .filter((key) => typeof slots[key] !== 'object')
          .map((key) => ['pages', page, key]),
      },
      ...Object.keys(slots)
        .filter((key) => typeof slots[key] === 'object')
        .map((slot) => ({ label: `${formatKeyToLabel(page)} › ${formatKeyToLabel(slot)}`, paths: [['pages', page, slot]] })),
    ]),
  ]
})

function getAt(path: string[]): unknown {
  return path.reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], content.value)
}

function schemaAt(path: string[]) {
  return path.reduce<SiteSchemaNode | undefined>((node, key) => node?.properties?.[key], template.value?.schema)
}

function setAt(path: string[], value: unknown) {
  ;(getAt(path.slice(0, -1)) as Record<string, unknown>)[path.at(-1)!] = value
}

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
const contentErrors = computed(() => Object.entries(errors.value).filter(([field]) => field.startsWith('data')))

const previewHtml = ref('')
const isPreviewLoading = ref(false)

const loadPreview = useDebounceFn(async () => {
  isPreviewLoading.value = true
  try {
    const res = await $fetch<{ html: string }>('/api/site/template/preview', {
      method: 'POST',
      body: { templateId: props.templateId, brand: brand.value, data: content.value },
    })
    previewHtml.value = res.html
  } catch {
    // An invalid or half-typed field is reported on save; keep the last good preview meanwhile
  } finally {
    isPreviewLoading.value = false
  }
}, 800)

watch([brand, content], loadPreview, { deep: true, immediate: true })

async function onSave() {
  isSaving.value = true
  errors.value = {}
  notice.value = ''

  try {
    const body = { ...(isEdit ? {} : { slug: slug.value }), templateId: props.templateId, brand: brand.value, domains: domainList.value, data: content.value }
    const saved = await $fetch<Site>(isEdit ? `/api/site/${props.site!.slug}` : '/api/site', { method: isEdit ? 'PUT' : 'POST', body })

    if (isEdit) notice.value = 'Saved. The changes are live.'
    else await navigateTo(`/site/${saved.slug}?created=1`)
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
      <iframe :srcdoc="previewHtml" sandbox="allow-same-origin" title="Site preview" class="size-full border-0 bg-white" :class="{ 'opacity-60': isPreviewLoading }" />
    </div>

    <AppSidebar v-model:open="isDrawerOpen" as-drawer-on-mobile>
      <template #header>
        <h1 class="text-xl font-semi-bold capitalize tracking-tight text-white">{{ isEdit ? site!.brand.name : templateId.replace(/-/g, ' ') }}</h1>
        <p class="my-1 mb-3 text-xs text-light-500">{{ isEdit ? 'Edit the brand, domains and content' : 'Fill details to update preview' }}</p>
      </template>

      <div v-if="isEdit" class="mb-4 flex flex-col gap-2 rounded-xl border border-dark-400 bg-dark-500/50 p-4 text-sm">
        <p v-if="notice" class="font-semi-bold text-success-500">{{ notice }}</p>
        <p class="text-light-500">Live for anyone with the link:</p>
        <a :href="liveUrl" target="_blank" rel="noopener" class="hover:text-accent-300 break-all font-semi-bold text-accent-400">{{ liveUrl }}</a>
        <a v-if="customUrl" :href="customUrl" target="_blank" rel="noopener" class="break-all text-light-400 hover:text-white">{{ customUrl }}</a>
      </div>

      <div class="flex flex-col gap-4">
        <FormField v-if="!isEdit" v-model="slug" label="Slug" schema-type="text" :error-message="errors.slug" />

        <FormField v-for="field in fields" :key="field.path" v-model="brand[field.path]" :label="field.label" schema-type="text" :error-message="errors[`brand.${field.path}`]" />

        <FormField v-for="key in colorKeys" :key="key" v-model="brand.colors[key]" :label="`${formatKeyToLabel(key)} Color`" schema-type="text" :error-message="errors[`brand.colors.${key}`]" />

        <FormField v-model="domains" label="Domains (one per line)" schema-type="textarea" :required="false" :error-message="domainError" />

        <h2 class="mt-2 border-t border-dark-500/50 pt-4 text-sm font-semi-bold text-white">Content</h2>

        <details v-for="group in groups" :key="group.label" class="rounded-xl border border-dark-400 bg-dark-500/50">
          <summary class="cursor-pointer select-none px-4 py-3 text-sm font-semi-bold text-white">{{ group.label }}</summary>
          <div class="flex flex-col gap-3 px-4 pb-4">
            <SiteContentNode
              v-for="path in group.paths"
              :key="path.join('.')"
              :model-value="getAt(path)"
              :name="path.at(-1)"
              :schema="schemaAt(path)"
              :label="path.length > 1 && typeof getAt(path) !== 'object' ? formatKeyToLabel(path.at(-1)!) : ''"
              @update:model-value="setAt(path, $event)" />
          </div>
        </details>

        <ul v-if="contentErrors.length" class="text-error-500 flex flex-col gap-1 text-xs">
          <li v-for="[field, message] in contentErrors" :key="field">{{ field }}: {{ message }}</li>
        </ul>

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
