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
  Approved: 'bg-success-500/20 text-success-400',
  'In Review': 'bg-warning-500/20 text-warning-400',
  Draft: 'bg-info-500/20 text-info-400',
  Rejected: 'bg-alert-500/20 text-alert-400',
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
    <ProjectMetaRow :index="project?.index" :slug="project?.slug" :status="project?.status" :segment="project?.segment" />

    <!-- Kanban Columns Section -->
    <section class="scrollbar-hidden flex min-h-0 grow gap-4 overflow-x-auto p-4 md:gap-6 md:p-8">
      <div v-if="pending" class="flex gap-4 md:gap-6">
        <div v-for="i in 4" :key="i" class="h-96 w-72 shrink-0 animate-pulse rounded-xl bg-dark-500 md:w-80" />
      </div>

      <template v-else>
        <div v-for="column in columns" :key="column.id" class="flex w-72 shrink-0 flex-col gap-4 md:w-80">
          <!-- Column Header Pill -->
          <div class="flex items-center justify-between rounded-full bg-dark-500 fill-light-500 px-2 py-1.5 text-light-500">
            <span class="flex items-center gap-2 pl-1">
              <NuxtIcon name="local:grip" class="shrink-0 text-lg" />
              <span class="inline-flex items-center gap-2 rounded-full bg-info-600/40 px-3 py-1 text-sm font-semi-bold text-info-400">
                <span class="size-2 rounded-full bg-info-400" />
                {{ column.label }}
              </span>
            </span>
          </div>

          <!-- Column Cards List -->
          <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-4 overflow-y-auto pb-4">
            <p v-if="!itemsByKind[column.id].length" class="px-2 text-xs text-light-500">Nothing here yet</p>

            <article v-for="(item, position) in itemsByKind[column.id]" :key="item.id" class="overflow-hidden rounded-xl bg-dark-500">
              <NuxtLink :to="detailPath(column.id, item)" class="block">
                <!-- Card Preview (Image or Striped Placeholder) -->
                <div class="relative aspect-[2/1] w-full overflow-hidden bg-dark-600">
                  <NuxtImg v-if="item.imageId" :src="item.imageId" :alt="item.title" width="480" class="size-full object-cover object-top" />
                  <img v-else :src="placeholderImage(item.index)" :alt="item.title" class="size-full object-cover" />

                  <span class="absolute left-2.5 top-2.5 rounded bg-dark-400/90 px-2 py-0.5 text-xs font-semi-bold text-white shadow">#{{ item.index || position + 1 }}</span>

                  <span v-if="item.duration" class="absolute right-2.5 top-2.5 rounded bg-dark-400/90 px-2 py-0.5 text-xs font-semi-bold text-white shadow">
                    {{ item.duration }}
                  </span>
                </div>

                <!-- Card Details -->
                <div class="space-y-3 p-4 pb-2">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="text-base font-semi-bold text-white">{{ item.title }}</h3>
                    <span
                      v-if="item.status"
                      class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semi-bold"
                      :class="statusStyles[item.status] ?? 'bg-dark-600 text-light-500'">
                      {{ item.status }}
                    </span>
                  </div>

                  <p v-if="item.specs" class="line-clamp-2 text-xs leading-relaxed text-light-500">{{ item.specs }}</p>

                  <div v-if="item.tags.length" class="flex flex-wrap items-center gap-1.5 pt-1">
                    <span v-for="tag in item.tags" :key="tag" class="inline-flex items-center rounded bg-dark-600/90 px-2 py-1 text-[11px] font-regular text-light-600">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </NuxtLink>

              <!-- Footer: Collaborator Avatars & Share Action -->
              <div class="flex items-center justify-between px-4 pb-4 pt-1">
                <div class="flex -space-x-2">
                  <span
                    v-for="collab in item.collaborators"
                    :key="collab.id"
                    class="flex size-7 items-center justify-center overflow-hidden rounded-full border-2 border-dark-500 bg-dark-600 text-[10px] font-semi-bold text-white"
                    :title="collab.name">
                    <img v-if="collab.avatar" :src="collab.avatar" :alt="collab.name" class="size-full object-cover" />
                    <span v-else>{{ initials(collab.name) }}</span>
                  </span>
                </div>

                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-semi-bold text-white transition-colors hover:bg-accent-600"
                  @click="copyShareLink(column.id, item)">
                  <NuxtIcon name="local:link" class="shrink-0 text-sm" />
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
