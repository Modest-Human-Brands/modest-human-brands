<script setup lang="ts">
definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string

// Same org slug the Sync page uses for share links
const { orgSlug } = useActiveOrg()

const { data: project } = await useFetch(`/api/project/${projectId}`)
const { data: stream } = await useFetch<ProjectStreamCollection | null>(`/api/stream/${project.value?.slug}`, { default: () => null })

const [shoots, scripts, storyboards, looks] = await Promise.all(
  (['shoot', 'script', 'storyboard', 'look'] as const).map((kind) => useFetch<ProjectItem[]>(`/api/project/${projectId}/${kind}`, { default: () => [] }))
)

const normalize = (id: string) => id.replace(/-/g, '')

const rows = computed(() => {
  const kinds = [
    { kind: 'script' as const, items: scripts.data.value },
    { kind: 'storyboard' as const, items: storyboards.data.value },
    { kind: 'look' as const, items: looks.data.value },
  ]

  const build = (title: string, matches: (item: ProjectItem) => boolean) => ({
    title,
    cards: kinds.flatMap(({ kind, items }) => items.filter(matches).map((item) => ({ kind, item }))),
  })

  const assigned = shoots.data.value.map((shoot) => build(shoot.title, (item) => item.shootIds.includes(normalize(shoot.id))))
  const shootIds = new Set(shoots.data.value.map((shoot) => normalize(shoot.id)))
  const unassigned = build('Unassigned', (item) => !item.shootIds.some((id) => shootIds.has(id)))

  return [...assigned, ...(unassigned.cards.length ? [unassigned] : [])]
})
</script>

<template>
  <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-6 overflow-y-auto pb-8">
    <ProjectMetaRow :index="project?.index" :slug="project?.slug" :status="project?.status" :segment="project?.segment" class="shrink-0" />

    <section class="px-4 md:px-8">
      <CardStreamCollection v-if="stream" :org-slug="orgSlug" :stream-collection="stream" />
      <p v-else class="rounded-lg bg-dark-500 p-4 text-sm text-light-500">No live stream registered for this project.</p>
    </section>

    <!-- Figma: each shoot is a vertical pill label with its cards in a row beside it -->
    <section v-for="row in rows" :key="row.title" class="flex gap-4 px-4 md:px-8">
      <div class="flex w-12 shrink-0 justify-center self-stretch rounded-full bg-dark-500 py-4">
        <span class="flex rotate-180 items-center gap-1.5 whitespace-nowrap rounded-full bg-info-400/40 px-3 py-1 text-sm [text-orientation:mixed] [writing-mode:vertical-rl]">
          <span class="size-3 rounded-full bg-info-500" />
          {{ row.title }}
        </span>
      </div>
      <div class="scrollbar-hidden flex gap-6 overflow-x-auto">
        <ProjectItemCard v-for="card in row.cards" :key="`${card.kind}-${card.item.id}`" :project-id="projectId" :kind="card.kind" :item="card.item" />
        <p v-if="!row.cards.length" class="self-center text-xs text-light-500">No script, storyboard or look assigned to this shoot yet.</p>
      </div>
    </section>

    <p v-if="!rows.length" class="text-sm text-light-500">No shoots planned for this project yet.</p>
  </div>
</template>
