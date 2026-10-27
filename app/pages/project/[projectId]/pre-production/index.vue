<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

type PreProductionKind = 'script' | 'storyboard' | 'look' | 'setup'

const route = useRoute()
const projectId = route.params.projectId as string

const columns: { id: PreProductionKind; label: string }[] = [
  { id: 'script', label: 'Script' },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'look', label: 'Look' },
  { id: 'setup', label: 'Setup' },
]

const { data: project } = await useFetch(`/api/project/${projectId}`)

const [script, storyboard, look, setup] = await Promise.all(columns.map(({ id }) => useFetch<ProjectItem[]>(`/api/project/${projectId}/${id}`, { default: () => [] })))

const itemsByKind = computed<Record<PreProductionKind, ProjectItem[]>>(() => ({
  script: script.data.value,
  storyboard: storyboard.data.value,
  look: look.data.value,
  setup: setup.data.value,
}))

const pending = computed(() => script.pending.value || storyboard.pending.value || look.pending.value || setup.pending.value)

const statusStyles: Record<string, string> = {
  Approved: 'bg-success-400 text-dark-400',
  'In Review': 'bg-warning-400 text-dark-400',
  Draft: 'bg-info-400 text-dark-400',
  Rejected: 'bg-alert-400 text-dark-400',
}

function detailPath(kind: PreProductionKind, item: ProjectItem) {
  return `/project/${projectId}/pre-production/${kind}?item=${item.id}`
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const { copy } = useClipboard()

async function copyShareLink(kind: PreProductionKind, item: ProjectItem): Promise<void> {
  await copy(`${window.location.origin}${detailPath(kind, item)}`)
}
</script>

<template>
  <div class="flex min-h-0 grow flex-col overflow-hidden">
    <!-- Figma: the action bar is right-aligned across the header edge, above the meta row -->
    <AppActionbar class="relative z-10 -mt-3.5 shrink-0 px-4 md:px-8" />
    <ProjectMetaRow :index="project?.index" :slug="project?.slug" :status="project?.status" :segment="project?.segment" />

    <!-- Kanban Columns Section -->
    <section class="scrollbar-hidden flex min-h-0 grow gap-4 overflow-x-auto p-4 md:gap-6 md:p-8">
      <div v-if="pending" class="flex gap-4 md:gap-6">
        <div v-for="i in 4" :key="i" class="h-96 w-72 shrink-0 animate-pulse rounded-lg bg-dark-500 md:w-[265px]" />
      </div>

      <template v-else>
        <div v-for="column in columns" :key="column.id" class="flex w-72 shrink-0 flex-col gap-4 md:w-[265px] md:gap-6">
          <KanbanHeader :title="column.label" />

          <!-- Column Cards List -->
          <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-6 overflow-y-auto pb-4">
            <p v-if="!itemsByKind[column.id].length" class="py-4 text-center text-xs text-light-500">Nothing here yet</p>

            <!-- Figma: Card/Item (256 wide, radius 4) -->
            <article v-for="(item, position) in itemsByKind[column.id]" :key="item.id" class="relative min-h-[256px] overflow-hidden rounded bg-dark-500 md:w-64">
              <NuxtLink :to="detailPath(column.id, item)" class="block">
                <div class="relative aspect-[2/1] w-full overflow-hidden bg-dark-600">
                  <NuxtImg v-if="item.imageId" :src="item.imageId" :alt="item.title" width="480" class="size-full object-cover object-top" />
                  <img v-else :src="placeholderImage(item.index)" :alt="item.title" class="size-full object-cover" />

                  <span class="absolute left-1 top-1 rounded bg-dark-500 px-2 pb-[3px] pt-0.5 text-2xs">#{{ item.index || position + 1 }}</span>

                  <span v-if="item.duration" class="absolute right-1 top-1 rounded bg-dark-500 px-2 pb-[3px] pt-0.5 text-2xs">
                    {{ item.duration }}
                  </span>
                </div>

                <div class="flex flex-col gap-1 px-2 pb-9 pt-2">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="min-w-0 truncate text-sm text-white">{{ item.title }}</h3>
                    <span v-if="item.status" class="inline-flex shrink-0 items-center rounded px-2 pb-[3px] pt-0.5 text-2xs" :class="statusStyles[item.status] ?? 'bg-dark-600 text-light-500'">
                      {{ item.status }}
                    </span>
                  </div>

                  <p v-if="item.specs" class="line-clamp-3 text-xs text-white/60">{{ item.specs }}</p>

                  <div v-if="item.tags.length" class="flex items-center gap-1.5 overflow-hidden pt-1">
                    <span v-for="tag in item.tags" :key="tag" class="inline-flex shrink-0 items-center whitespace-nowrap rounded bg-dark-600 px-2 py-1 text-xs text-white">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </NuxtLink>

              <!-- Footer: Collaborator Avatars & Share Action -->
              <div class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between pl-2">
                <div class="mb-2 flex -space-x-2">
                  <span
                    v-for="collab in item.collaborators"
                    :key="collab.id"
                    class="flex size-6 items-center justify-center overflow-hidden rounded-full border-2 border-dark-500 bg-dark-600 text-2xs text-white"
                    :title="collab.name">
                    <img v-if="collab.avatar" :src="collab.avatar" :alt="collab.name" class="size-full object-cover" />
                    <span v-else>{{ initials(collab.name) }}</span>
                  </span>
                </div>

                <button
                  type="button"
                  class="pointer-events-auto flex items-center gap-1 rounded-tl-md bg-accent-500 px-2 py-1 text-2xs text-white transition-colors hover:bg-accent-600"
                  @click="copyShareLink(column.id, item)">
                  <NuxtIcon name="local:link" class="shrink-0 text-base" />
                  Share
                </button>
              </div>
            </article>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
