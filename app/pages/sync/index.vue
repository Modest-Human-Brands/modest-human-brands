<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { data: streamCollections, pending } = await useFetch('/api/stream')
const { orgSlug } = useActiveOrg()

// Figma: Scheduled / Live / Vod. Errored streams stay under Scheduled, where they can be restarted
const columns: { id: string; label: string; statuses: StreamStatus[] }[] = [
  { id: 'scheduled', label: 'Scheduled', statuses: [StreamStatus.Idle, StreamStatus.Starting, StreamStatus.Error] },
  { id: 'live', label: 'Live', statuses: [StreamStatus.Live, StreamStatus.Paused, StreamStatus.Stopping] },
  { id: 'vod', label: 'Vod', statuses: [StreamStatus.Stopped, StreamStatus.Processing, StreamStatus.Ready] },
]

const timestamp = (date?: string) => (date ? new Date(date).getTime() : 0)

const collectionsByColumn = computed(() =>
  columns.map((column) => ({
    ...column,
    items: (streamCollections.value ?? []).filter((stream) => column.statuses.includes(stream.status)).sort((a, b) => timestamp(b.date) - timestamp(a.date)),
  }))
)
</script>

<template>
  <section class="scrollbar-hidden flex h-full gap-4 overflow-x-auto p-4 md:gap-6 md:p-8">
    <template v-if="pending">
      <div v-for="i in 3" :key="i" class="h-96 w-72 shrink-0 animate-pulse rounded-lg bg-dark-500 md:w-[352px]" />
    </template>

    <template v-else>
      <div v-for="column in collectionsByColumn" :key="column.id" class="flex min-h-0 w-72 shrink-0 flex-col gap-4 md:w-[352px] md:gap-6">
        <KanbanHeader :title="column.label" />

        <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-6 overflow-y-auto pb-4">
          <p v-if="!column.items.length" class="py-4 text-center text-xs text-light-500">Nothing here yet</p>
          <CardStreamCollection v-for="stream in column.items" :key="stream.slug" :org-slug="orgSlug" :stream-collection="stream" />
        </div>
      </div>
    </template>
  </section>
</template>
