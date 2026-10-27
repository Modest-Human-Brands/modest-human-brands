<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId as string

const { data: project } = await useFetch(`/api/project/${projectId}`)

const editedAt = computed(() => project.value?.updatedAt ?? new Date().toISOString())
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })

// Project pages live under the dashboard tab; the viewbar highlights the current project step
const activeTab = PRIMARY_NAVIGATION_TABS[0]!
// Below lg the project steps live in a bottom drawer that peeks its handle, so the page keeps the full width
const isNavOpen = ref(false)
watch(
  () => route.fullPath,
  () => (isNavOpen.value = false)
)

const handleRef = useTemplateRef<HTMLElement>('handleRef')
const { direction } = useSwipe(handleRef, {
  onSwipeEnd() {
    if (direction.value === 'up') isNavOpen.value = true
    else if (direction.value === 'down') isNavOpen.value = false
  },
})

const activeStep = computed(() => route.path.split('/').filter(Boolean).pop() ?? 'plan')
</script>

<template>
  <div class="flex h-dvh w-screen items-start justify-start bg-dark-400">
    <LazyAppNavbar :active-key="activeTab.id" hydrate-on-idle />

    <main class="relative isolate mx-auto flex h-dvh w-full grow overflow-hidden">
      <div class="flex min-h-0 grow flex-col overflow-hidden pb-6 lg:pb-0">
        <header class="scrollbar-hidden flex shrink-0 items-center justify-between overflow-x-auto px-4 py-4 md:px-8">
          <div class="flex min-w-0 items-center gap-3 md:gap-4">
            <NuxtIcon name="local:target" class="shrink-0 text-4xl" />
            <div class="flex min-w-0 flex-col">
              <span class="d:text-2xl w-full truncate text-xl">
                {{ project.title }}
              </span>
            </div>
          </div>
          <!-- Star and more stay in the header; from lg up they sit in the side column -->
          <div class="ml-4 flex shrink-0 items-center gap-1 lg:hidden">
            <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
          </div>
        </header>
        <div class="relative isolate mx-auto flex min-h-0 w-full grow flex-col overflow-hidden">
          <slot />
        </div>
      </div>

      <!-- Below lg: bottom-up drawer, same look as AppSidebar's mobile drawer -->
      <div
        class="absolute inset-0 z-30 bg-black transition-opacity duration-300 lg:hidden"
        :class="isNavOpen ? 'pointer-events-auto opacity-60' : 'pointer-events-none opacity-0'"
        @click="isNavOpen = false" />

      <div
        id="project-steps"
        class="absolute inset-x-0 bottom-0 z-40 flex max-h-[70dvh] flex-col rounded-t-3xl border-t border-white/5 bg-dark-400 transition-transform duration-300 lg:hidden"
        :class="isNavOpen ? 'translate-y-0' : 'translate-y-[calc(100%-24px)]'">
        <button
          ref="handleRef"
          type="button"
          class="flex h-6 w-full shrink-0 touch-none items-center justify-center"
          :aria-expanded="isNavOpen"
          aria-label="Project steps"
          @click="isNavOpen = !isNavOpen">
          <span class="h-1.5 w-12 rounded-full bg-accent-500" />
        </button>
        <div class="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-2">
          <LazyAppViewbar :project-id="projectId" :active-key="activeStep" hydrate-on-idle />
        </div>
      </div>

      <!-- From lg up: the steps stay in the right-hand column -->
      <div class="hidden shrink-0 flex-col items-center justify-between overflow-x-auto bg-dark-400 px-4 py-6 lg:flex lg:gap-6">
        <!-- Figma: the activity bar and the page's action bar stack, right-aligned, above the viewbar -->
        <div class="flex flex-col items-end gap-4">
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
          <div id="project-actions" />
        </div>
        <LazyAppViewbar :project-id="projectId" :active-key="activeStep" hydrate-on-idle />
      </div>
    </main>
  </div>
</template>
