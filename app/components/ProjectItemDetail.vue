<script setup lang="ts">
type PreProductionKind = 'script' | 'storyboard' | 'look' | 'setup'

const props = defineProps<{ kind: PreProductionKind }>()

const route = useRoute()
const projectId = route.params.projectId as string

const sidePanelTitle: Record<PreProductionKind, string> = {
  script: 'Scenes',
  storyboard: 'Scenes',
  look: 'Appearance',
  setup: 'Setup',
}

const { data: project } = await useFetch(`/api/project/${projectId}`)
const { data: items } = await useFetch<ProjectItem[]>(`/api/project/${projectId}/${props.kind}`, { default: () => [] })
// Scenes are the storyboard frames; same URL as the storyboard page so the fetch is shared
const { data: scenes } = await useFetch<ProjectItem[]>(`/api/project/${projectId}/storyboard`, { default: () => [] })

const selected = computed(() => items.value.find((item) => item.id === route.query.item) ?? items.value[0])

// A setup layout lists the equipment placed in it; other kinds never fetch it
const { data: equipment } = await useFetch<ProjectItem[]>(`/api/project/${projectId}/equipment`, { default: () => [], immediate: props.kind === 'setup' })
const normalizeId = (id: string) => id.replaceAll('-', '')
const setupEquipment = computed(() => {
  const ids = new Set((selected.value?.equipmentIds ?? []).map(normalizeId))
  return equipment.value.filter((item) => ids.has(normalizeId(item.id)))
})

// Script text comes from the linked MDoc document, shown as a preview
const documentId = computed(() => (props.kind === 'script' ? selected.value?.documentId : undefined))
const { data: doc, execute: loadDocument } = useFetch<{ id: string; name: string; previewUrl: string }>(() => `/api/doc/${projectId}/${documentId.value}`, { immediate: false, watch: false })

if (documentId.value) await loadDocument()
watch(documentId, (id) => {
  if (id) loadDocument()
})

const statusStyles: Record<string, string> = {
  Approved: 'bg-success-400',
  'In Review': 'bg-warning-400',
  Draft: 'bg-info-400',
  Rejected: 'bg-alert-400',
}

const pad = (value: number) => String(value).padStart(2, '0')
</script>

<template>
  <div class="relative flex min-h-0 grow flex-col overflow-hidden">
    <div v-if="!items.length" class="my-24 flex flex-col items-center justify-center text-light-500/40">
      <p class="text-sm">No {{ kind }} items for this project yet</p>
    </div>

    <div v-else class="flex min-h-0 grow flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <!-- Item thumbnails -->
      <nav class="scrollbar-hidden relative flex shrink-0 gap-4 overflow-auto px-4 pb-2 md:px-4 lg:w-[148px] lg:flex-col lg:justify-center lg:pb-0 lg:pr-4">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="{ query: { item: item.id } }"
          class="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white lg:h-[116px] lg:w-[116px]"
          :class="item.id === selected?.id ? 'ring-2 ring-accent-500' : ''"
          :title="item.title">
          <NuxtImg v-if="item.imageId" :src="item.imageId" :alt="item.title" width="232" class="size-full object-cover object-top" />
          <img v-else :src="placeholderImage(item.index)" :alt="item.title" class="size-full object-cover" />
        </NuxtLink>
        <button type="button" class="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-dark-500 lg:h-[116px] lg:w-[116px]" aria-label="Add item">
          <span class="grid size-11 place-items-center rounded-full border border-dashed border-white">
            <NuxtIcon name="local:plus" class="text-[32px]" />
          </span>
        </button>
      </nav>

      <!-- Meta + canvas -->
      <div class="scrollbar-hidden flex min-w-0 grow flex-col overflow-y-auto pb-24">
        <ProjectMetaRow :index="project?.index" :slug="project?.slug" :status="project?.status" :segment="project?.segment" class="px-0 md:px-0" />

        <main class="flex min-w-0 flex-col gap-3 px-4 lg:px-0 lg:pr-10">
          <template v-if="kind === 'script'">
            <h2 class="pt-2 text-[32px] leading-tight text-white">{{ selected?.title }}</h2>
            <PdfDocumentViewer v-if="doc?.previewUrl" :src="doc.previewUrl" :doc="{ id: doc.id, name: doc.name, previewUrl: doc.previewUrl }" class="h-[70dvh] rounded-lg" />
            <p v-else class="rounded-lg bg-dark-500 p-6 text-sm text-light-500">No script document linked to this item.</p>
          </template>

          <!-- Figma: frame card, 24px title, dotted tag line, frames below -->
          <div v-else class="flex flex-col gap-6 rounded-lg bg-dark-500 p-6">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 flex-col gap-2">
                <h2 class="truncate text-xl text-white">{{ selected?.title }}</h2>
                <p v-if="selected && itemLabels(selected, kind).length" class="text-base text-white">{{ itemLabels(selected, kind).join(' • ') }}</p>
              </div>
              <button type="button" class="shrink-0" aria-label="More">
                <NuxtIcon name="local:dots" class="text-[24px]" />
              </button>
            </div>
            <div class="overflow-hidden rounded">
              <NuxtImg v-if="selected?.imageId" :src="selected.imageId" :alt="selected.title" width="1200" class="w-full object-contain" />
              <img v-else-if="selected" :src="placeholderImage(selected.index)" :alt="selected.title" class="w-full object-cover" />
            </div>
          </div>
        </main>
      </div>

      <!-- Side panel -->
      <aside class="flex w-full shrink-0 flex-col border-white/10 lg:w-[433px] lg:overflow-y-auto lg:border-l">
        <div class="flex items-center justify-between px-6 pt-4">
          <h3 class="text-2xl text-white">{{ sidePanelTitle[kind] }}</h3>
          <span v-if="selected?.status" class="rounded px-2 py-1 text-base text-dark-400" :class="statusStyles[selected.status] ?? 'bg-dark-600 text-light-500'">
            {{ selected.status }}
          </span>
        </div>

        <ol v-if="kind === 'script' || kind === 'storyboard'" class="flex flex-col gap-4 px-6 py-4">
          <li v-for="(scene, position) in scenes" :key="scene.id" class="flex items-center justify-between text-base text-white">
            <span class="flex gap-4">
              <span class="w-6">{{ pad(scene.index || position + 1) }}</span>
              {{ scene.title }}
            </span>
            <span>{{ scene.duration }}</span>
          </li>
          <li v-if="!scenes.length" class="text-xs text-light-500">No storyboard scenes yet</li>
        </ol>

        <ol v-else-if="kind === 'look'" class="flex flex-col gap-4 px-6 py-4">
          <li v-for="(tag, position) in selected?.tags ?? []" :key="tag" class="flex gap-4 text-base text-white">
            <span class="w-6">{{ pad(position + 1) }}</span>
            {{ tag }}
          </li>
          <li v-if="!selected?.tags.length" class="text-xs text-light-500">No appearance notes yet</li>
        </ol>

        <!-- Figma: equipment card, name + kind chip, description, then Location / Assigned -->
        <ul v-else class="flex flex-col gap-6 px-6 py-4">
          <li v-for="item in setupEquipment" :key="item.id" class="flex gap-4">
            <div class="flex min-w-0 grow flex-col gap-2">
              <div class="flex items-start justify-between gap-2">
                <h4 class="truncate text-base uppercase text-white">{{ item.title }}</h4>
                <span class="flex shrink-0 gap-1.5 text-2xs text-dark-400">
                  <span v-if="item.status" class="rounded px-2 pb-[3px] pt-0.5" :class="item.status === 'Active' ? 'bg-success-400' : 'bg-light-500'">{{ item.status }}</span>
                  <span class="rounded bg-alert-400 px-2 pb-[3px] pt-0.5">#{{ item.index }}</span>
                </span>
              </div>
              <span v-if="item.kind" class="w-fit rounded bg-dark-500 px-2 py-1 text-sm text-white">{{ item.kind }}</span>
              <p v-if="item.specs" class="text-sm text-white">{{ item.specs }}</p>
            </div>
            <dl class="flex w-[117px] shrink-0 flex-col gap-1 text-2xs">
              <div v-if="item.location" class="rounded-l bg-dark-500 px-2 py-1">
                <dt class="text-xs text-white/60">Location</dt>
                <dd class="text-white">{{ item.location }}</dd>
              </div>
              <div v-if="item.collaborators.length" class="rounded-l bg-dark-500 px-2 py-1">
                <dt class="text-xs text-white/60">Assigned</dt>
                <dd class="text-white">{{ item.collaborators.map((c) => c.name).join(', ') }}</dd>
              </div>
            </dl>
          </li>
          <li v-if="!setupEquipment.length" class="text-xs text-light-500">No equipment in this setup yet</li>
        </ul>

        <!-- Placeholder until activity tracking exists -->
        <div class="border-t border-white/10 px-6 py-4">
          <div class="flex items-center justify-between">
            <h4 class="text-base text-white">Activity Timeline</h4>
          </div>
          <div class="flex items-center gap-3 pt-4">
            <span class="grid size-6 place-items-center rounded-full bg-dark-500">
              <NuxtIcon name="local:eye" class="text-base" />
            </span>
            <p class="text-sm text-white/60">Activity will appear here.</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Figma: floating toolbar (static until paging, zoom and export exist) -->
    <div class="pointer-events-none absolute inset-x-0 bottom-8 hidden justify-center lg:flex lg:pr-[433px]">
      <div class="pointer-events-auto flex h-12 items-center gap-4 rounded-full bg-dark-500 px-6 text-white shadow-xl">
        <button type="button" aria-label="Previous"><NuxtIcon name="local:chevron-bold" class="text-[24px]" /></button>
        <span class="text-sm">1/{{ items.length }}</span>
        <button type="button" aria-label="Next"><NuxtIcon name="local:chevron-bold" class="rotate-180 text-[24px]" /></button>
        <span class="h-6 w-px bg-white/20" />
        <button type="button" aria-label="Zoom in"><NuxtIcon name="local:plus" class="text-[24px]" /></button>
        <button type="button" aria-label="Zoom out"><NuxtIcon name="local:minus" class="text-[24px]" /></button>
        <span class="h-6 w-px bg-white/20" />
        <button type="button" aria-label="Comment"><NuxtIcon name="local:comment" class="text-[24px]" /></button>
        <button type="button" aria-label="Download"><NuxtIcon name="local:download" class="text-[24px]" /></button>
        <button type="button" aria-label="Print"><NuxtIcon name="local:print" class="text-[24px]" /></button>
      </div>
    </div>
  </div>
</template>
