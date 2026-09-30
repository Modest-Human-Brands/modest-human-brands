<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = (route.params.projectId as string) || ''

export type PreProductionColumnId = 'script' | 'storyboard' | 'look' | 'setup'

export type ItemStatus = 'Approved' | 'In Review' | 'Draft' | 'Rejected'

export interface ItemCollaborator {
  id: string
  name: string
  avatar?: string
}

export interface PreProductionItem {
  id: string
  columnId: PreProductionColumnId
  itemNumber: string
  title: string
  description: string
  status: ItemStatus
  previewUrl?: string
  timeBadge?: string
  tags?: string[]
  collaborators: ItemCollaborator[]
  shareUrl?: string
}

export interface PreProductionColumn {
  id: PreProductionColumnId
  label: string
}

// Fetch project data if available, with reactive fallback values
const { data: project } = await useFetch<Record<string, string>>(`/api/project/${projectId}`)

// Dynamic, editable project meta summary bar
const projectMeta = ref({
  index: project.value?.index ?? 75,
  slug: project.value?.slug ?? 'mhb-ad-shoot-75',
  status: project.value?.status ?? 'Shoot',
  segment: project.value?.segment ?? 'Ad Commercial',
})

// Column definitions
const columns = ref<PreProductionColumn[]>([
  { id: 'script', label: 'Script' },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'look', label: 'Look' },
  { id: 'setup', label: 'Setup' },
])

// Dynamic, hard-coded placeholder items matching the screenshot
const items = ref<PreProductionItem[]>([
  // Script Column Items
  {
    id: 'script-1',
    columnId: 'script',
    itemNumber: '#1',
    title: 'Stop the chaos',
    description: "Nobody starts a creative agency to chase management chaos. But suddenly You're spending 90% of your time managing 8...",
    status: 'Approved',
    collaborators: [
      {
        id: 'u1',
        name: 'Aratrik Nandy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
    ],
  },
  {
    id: 'script-2',
    columnId: 'script',
    itemNumber: '#2',
    title: 'Cut Management Time',
    description: "If you're an agency owner or freelancer running your business out of 8 different apps... please stop. (Leans forward, speaki...",
    status: 'Approved',
    collaborators: [
      {
        id: 'u1',
        name: 'Aratrik Nandy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
    ],
  },

  // Storyboard Column Items
  {
    id: 'storyboard-1',
    columnId: 'storyboard',
    itemNumber: '#1',
    timeBadge: '01:09',
    title: 'Stop the chaos',
    description: "Nobody starts a creative agency to chase management chaos. But suddenly You're...",
    status: 'Approved',
    previewUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
    tags: ['Medium Shot', 'Camera Pull Back', 'Graph...'],
    collaborators: [
      {
        id: 'u1',
        name: 'Aratrik Nandy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
    ],
  },
  {
    id: 'storyboard-2',
    columnId: 'storyboard',
    itemNumber: '#2',
    timeBadge: '00:52',
    title: 'Cut Management Time',
    description: "If you're an agency owner or freelancer running your business out of 8 different a...",
    status: 'Approved',
    previewUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    tags: ['Medium Shot', 'Camera Still', 'Graphic Ove...'],
    collaborators: [
      {
        id: 'u1',
        name: 'Aratrik Nandy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
    ],
  },

  // Look Column Items
  {
    id: 'look-1',
    columnId: 'look',
    itemNumber: '#1',
    timeBadge: '1 hours',
    title: 'The Corporate Professional',
    description: 'A clean, sharp corporate office look. Hair and makeup are neat and professional for...',
    status: 'Approved',
    previewUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    tags: ['Business Formal', 'Eyeglasses', 'Continui...'],
    collaborators: [
      {
        id: 'u1',
        name: 'Aratrik Nandy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      {
        id: 'u2',
        name: 'Rumeo Saha',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      },
    ],
  },
  {
    id: 'look-2',
    columnId: 'look',
    itemNumber: '#2',
    timeBadge: '30 min',
    title: 'Minimal Business Casual',
    description: 'A relaxed yet polished office look featuring a crisp white button-down shirt with clea...',
    status: 'Approved',
    previewUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    tags: ['White Shirt', 'Natural Makeup', 'Continui...'],
    collaborators: [
      {
        id: 'u1',
        name: 'Aratrik Nandy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      {
        id: 'u2',
        name: 'Rumeo Saha',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      },
    ],
  },
])

const pending = ref(false)

const statusStyles: Record<ItemStatus, string> = {
  Approved: 'bg-success-500/20 text-success-400',
  'In Review': 'bg-warning-500/20 text-warning-400',
  Draft: 'bg-info-500/20 text-info-400',
  Rejected: 'bg-alert-500/20 text-alert-400',
}

function itemsFor(columnId: PreProductionColumnId): PreProductionItem[] {
  return items.value.filter((item) => item.columnId === columnId)
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

async function copyShareLink(item: PreProductionItem): Promise<void> {
  const { copy } = useClipboard()
  const fallbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/${projectId}/pre-production/${item.id}` : ''
  await copy(item.shareUrl || fallbackUrl)
}

function addItem(columnId: PreProductionColumnId): void {
  const count = itemsFor(columnId).length + 1
  const id = `${columnId}-${Date.now()}`
  items.value.push({
    id,
    columnId,
    itemNumber: `#${count}`,
    title: 'Untitled Item',
    description: 'Provide an overview or description for this pre-production deliverable.',
    status: 'Draft',
    collaborators: [],
    tags: [],
  })
}
</script>

<template>
  <div class="flex min-h-0 grow flex-col overflow-hidden">
    <!-- Top Meta Row (Index, Slug, Status, Segment) -->
    <section class="scrollbar-hidden flex shrink-0 items-center gap-8 overflow-x-auto px-4 py-3 md:gap-14 md:px-8">
      <div class="flex flex-col gap-1">
        <span class="flex items-center gap-1.5 text-xs text-light-400">
          <NuxtIcon name="ph:dots-six-vertical" class="shrink-0 text-base" />
          Index
        </span>
        <span class="pl-5 text-sm font-semi-bold text-white">{{ projectMeta.index }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="flex items-center gap-1.5 text-xs text-light-400">
          <NuxtIcon name="ph:dots-six-vertical" class="shrink-0 text-base" />
          Slug
        </span>
        <span class="pl-5 text-sm font-semi-bold text-white">{{ projectMeta.slug }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="flex items-center gap-1.5 text-xs text-light-400">
          <NuxtIcon name="ph:dots-six-vertical" class="shrink-0 text-base" />
          Status
        </span>
        <span class="pl-5 text-sm font-semi-bold text-white">{{ projectMeta.status }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="flex items-center gap-1.5 text-xs text-light-400">
          <NuxtIcon name="ph:dots-six-vertical" class="shrink-0 text-base" />
          Segment
        </span>
        <span class="pl-5 text-sm font-semi-bold text-white">{{ projectMeta.segment }}</span>
      </div>
    </section>

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
              <NuxtIcon name="ph:dots-six-vertical" class="shrink-0 text-lg" />
              <span class="inline-flex items-center gap-2 rounded-full bg-info-600/40 px-3 py-1 text-sm font-semi-bold text-info-400">
                <span class="size-2 rounded-full bg-info-400" />
                {{ column.label }}
              </span>
            </span>

            <span class="flex items-center gap-1">
              <button type="button" class="rounded-full p-1.5 hover:bg-dark-600 hover:text-white">
                <NuxtIcon name="ph:dots-three" class="shrink-0 text-lg" />
              </button>
              <button type="button" class="rounded-full bg-dark-600 p-1.5 hover:bg-dark-400 hover:text-white" @click="addItem(column.id)">
                <NuxtIcon name="ph:plus" class="shrink-0 text-lg" />
              </button>
            </span>
          </div>

          <!-- Column Cards List -->
          <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-4 overflow-y-auto pb-4">
            <article v-for="item in itemsFor(column.id)" :key="item.id" class="overflow-hidden rounded-xl bg-dark-500">
              <!-- Card Preview (Image or Striped Placeholder) -->
              <div class="relative aspect-[2/1] w-full overflow-hidden bg-dark-600">
                <img v-if="item.previewUrl" :src="item.previewUrl" :alt="item.title" class="size-full object-cover object-top" />
                <!-- Diagonal stripes texture for empty/script cards -->
                <div v-else class="size-full bg-[repeating-linear-gradient(-45deg,#3D3D3D,#3D3D3D_12px,#2B2B2B_12px,#2B2B2B_24px)]" />

                <!-- Item Number Badge -->
                <span class="absolute left-2.5 top-2.5 rounded bg-dark-400/90 px-2 py-0.5 text-xs font-semi-bold text-white shadow">
                  {{ item.itemNumber }}
                </span>

                <!-- Duration / Time Badge -->
                <span v-if="item.timeBadge" class="absolute right-2.5 top-2.5 rounded bg-dark-400/90 px-2 py-0.5 text-xs font-semi-bold text-white shadow">
                  {{ item.timeBadge }}
                </span>
              </div>

              <!-- Card Details -->
              <div class="space-y-3 p-4">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-base font-semi-bold text-white">{{ item.title }}</h3>
                  <span class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semi-bold" :class="statusStyles[item.status]">
                    {{ item.status }}
                  </span>
                </div>

                <p class="line-clamp-2 text-xs leading-relaxed text-light-500">
                  {{ item.description }}
                </p>

                <!-- Tags / Shots list -->
                <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap items-center gap-1.5 pt-1">
                  <span v-for="tag in item.tags" :key="tag" class="inline-flex items-center rounded bg-dark-600/90 px-2 py-1 text-[11px] font-regular text-light-600">
                    {{ tag }}
                  </span>
                </div>

                <!-- Footer: Collaborator Avatars & Share Action -->
                <div class="flex items-center justify-between pt-1">
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
                    @click="copyShareLink(item)">
                    <NuxtIcon name="ph:link" class="shrink-0 text-sm" />
                    Share
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
