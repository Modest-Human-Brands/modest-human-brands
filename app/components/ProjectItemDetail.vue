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

// Script text comes from the linked MDoc document, shown as a preview
const documentId = computed(() => (props.kind === 'script' ? selected.value?.documentId : undefined))
const { data: doc, execute: loadDocument } = useFetch<{ id: string; name: string; previewUrl: string }>(() => `/api/doc/${projectId}/${documentId.value}`, { immediate: false, watch: false })

if (documentId.value) await loadDocument()
watch(documentId, (id) => {
  if (id) loadDocument()
})

const statusStyles: Record<string, string> = {
  Approved: 'bg-success-500/20 text-success-400',
  'In Review': 'bg-warning-500/20 text-warning-400',
  Draft: 'bg-info-500/20 text-info-400',
  Rejected: 'bg-alert-500/20 text-alert-400',
}

const pad = (value: number) => String(value).padStart(2, '0')
</script>

<template>
  <div class="scrollbar-hidden flex min-h-0 grow flex-col overflow-y-auto">
    <ProjectMetaRow :index="project?.index" :slug="project?.slug" :status="project?.status" :segment="project?.segment" />

    <div v-if="!items.length" class="my-24 flex flex-col items-center justify-center text-light-500/40">
      <p class="text-sm font-semi-bold">No {{ kind }} items for this project yet</p>
    </div>

    <div v-else class="flex min-h-0 grow flex-col gap-4 px-4 pb-8 md:px-8 lg:flex-row">
      <!-- Item thumbnails -->
      <nav class="scrollbar-hidden flex shrink-0 gap-2 overflow-auto lg:w-24 lg:flex-col">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="{ query: { item: item.id } }"
          class="size-16 shrink-0 overflow-hidden rounded-lg border bg-dark-500 lg:size-20"
          :class="item.id === selected?.id ? 'border-accent-500' : 'border-white/10'"
          :title="item.title">
          <NuxtImg v-if="item.imageId" :src="item.imageId" :alt="item.title" width="160" class="size-full object-cover" />
          <img v-else :src="placeholderImage(item.index)" :alt="item.title" class="size-full object-cover" />
        </NuxtLink>
      </nav>

      <!-- Canvas -->
      <main class="flex min-w-0 grow flex-col gap-3">
        <h2 class="text-xl font-semi-bold text-white">{{ selected?.title }}</h2>
        <div v-if="selected?.tags.length" class="flex flex-wrap gap-1.5">
          <span v-for="tag in selected.tags" :key="tag" class="rounded bg-dark-600/90 px-2 py-1 text-[11px] text-light-600">{{ tag }}</span>
        </div>

        <template v-if="kind === 'script'">
          <PdfDocumentViewer v-if="doc?.previewUrl" :src="doc.previewUrl" :doc="{ id: doc.id, name: doc.name, previewUrl: doc.previewUrl }" class="h-[70dvh] rounded-xl" />
          <p v-else class="rounded-xl bg-dark-500 p-6 text-sm text-light-500">No script document linked to this item.</p>
        </template>

        <template v-else>
          <div class="overflow-hidden rounded-xl bg-dark-500">
            <NuxtImg v-if="selected?.imageId" :src="selected.imageId" :alt="selected.title" width="1200" class="w-full object-contain" />
            <img v-else-if="selected" :src="placeholderImage(selected.index)" :alt="selected.title" class="w-full object-cover" />
          </div>
        </template>
      </main>

      <!-- Side panel -->
      <aside class="flex w-full shrink-0 flex-col gap-4 lg:w-80">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semi-bold text-white">{{ sidePanelTitle[kind] }}</h3>
          <span v-if="selected?.status" class="rounded-full px-2.5 py-0.5 text-xs font-semi-bold" :class="statusStyles[selected.status] ?? 'bg-dark-600 text-light-500'">
            {{ selected.status }}
          </span>
        </div>

        <ol v-if="kind === 'script' || kind === 'storyboard'" class="flex flex-col gap-2">
          <li v-for="(scene, position) in scenes" :key="scene.id" class="flex items-center justify-between text-sm text-light-400">
            <span>{{ pad(scene.index || position + 1) }} &nbsp; {{ scene.title }}</span>
            <span class="text-xs">{{ scene.duration }}</span>
          </li>
          <li v-if="!scenes.length" class="text-xs text-light-500">No storyboard scenes yet</li>
        </ol>

        <ol v-else-if="kind === 'look'" class="flex flex-col gap-2">
          <li v-for="(tag, position) in selected?.tags ?? []" :key="tag" class="text-sm text-light-400">{{ pad(position + 1) }} &nbsp; {{ tag }}</li>
          <li v-if="!selected?.tags.length" class="text-xs text-light-500">No appearance notes yet</li>
        </ol>

        <ul v-else class="flex flex-col gap-3">
          <li v-for="item in items" :key="item.id" class="flex flex-col gap-1 rounded-xl bg-dark-500 p-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-semi-bold text-white">{{ item.title }}</span>
              <span v-if="item.kind" class="rounded bg-dark-600 px-2 py-0.5 text-[11px] text-light-500">{{ item.kind }}</span>
            </div>
            <p v-if="item.specs" class="text-xs text-light-500">{{ item.specs }}</p>
            <p v-if="item.location" class="text-xs text-light-500">Location: {{ item.location }}</p>
            <p v-if="item.collaborators.length" class="text-xs text-light-500">Assigned: {{ item.collaborators.map((c) => c.name).join(', ') }}</p>
          </li>
        </ul>

        <!-- Placeholder until activity tracking exists -->
        <div class="border-t border-white/10 pt-4">
          <h4 class="text-sm font-semi-bold text-light-400">Activity Timeline</h4>
          <p class="pt-2 text-xs text-light-500">Activity will appear here.</p>
        </div>
      </aside>
    </div>
  </div>
</template>
