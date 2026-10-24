<script setup lang="ts">
definePageMeta({
  layout: 'project',
  middleware: ['auth'],
})

const route = useRoute()
const projectId = route.params.projectId as string

// Same org slug the Sync page uses for share links
const orgSlug = 'red-cat-pictures'

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
  <div class="scrollbar-hidden flex min-h-0 grow flex-col gap-6 overflow-y-auto px-4 pb-8 md:px-8">
    <ProjectMetaRow :index="project?.index" :slug="project?.slug" :status="project?.status" :segment="project?.segment" class="-mx-4 md:-mx-8" />

    <section>
      <CardStreamCollection v-if="stream" :org-slug="orgSlug" :stream-collection="stream" />
      <p v-else class="rounded-xl bg-dark-500 p-4 text-sm text-light-500">No live stream registered for this project.</p>
    </section>

    <section v-for="row in rows" :key="row.title" class="flex flex-col gap-3">
      <h3 class="text-base font-semi-bold text-white">{{ row.title }}</h3>
      <div class="scrollbar-hidden flex gap-3 overflow-x-auto pb-2">
        <ProjectItemCard v-for="card in row.cards" :key="`${card.kind}-${card.item.id}`" :project-id="projectId" :kind="card.kind" :item="card.item" />
        <p v-if="!row.cards.length" class="text-xs text-light-500">No script, storyboard or look assigned to this shoot yet.</p>
      </div>
    </section>

    <p v-if="!rows.length" class="text-sm text-light-500">No shoots planned for this project yet.</p>
  </div>
</template>
