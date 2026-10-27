<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId as string

const { data: project } = await useFetch(`/api/project/${projectId}`)

const editedAt = computed(() => project.value?.updatedAt ?? new Date().toISOString())
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })

// Project pages live under the dashboard tab; the viewbar highlights the current project step
const activeTab = PRIMARY_NAVIGATION_TABS[0]!
// Below lg the project steps live in a drawer behind a hamburger, so the page keeps the full width
const isNavOpen = ref(false)
watch(
  () => route.fullPath,
  () => (isNavOpen.value = false)
)

const activeStep = computed(() => route.path.split('/').filter(Boolean).pop() ?? 'plan')
</script>

<template>
  <div class="flex h-dvh w-screen items-start justify-start bg-dark-400">
    <LazyAppNavbar :active-key="activeTab.id" hydrate-on-idle />

    <main class="relative isolate mx-auto flex h-dvh w-full grow overflow-hidden">
      <div class="flex min-h-0 grow flex-col overflow-hidden">
        <header class="scrollbar-hidden flex shrink-0 items-center justify-between overflow-x-auto px-4 py-4 md:px-8">
          <div class="flex min-w-0 items-center gap-3 md:gap-4">
            <NuxtIcon name="local:target" class="shrink-0 text-4xl" />
            <div class="flex min-w-0 flex-col">
              <span class="d:text-2xl w-full truncate text-xl">
                {{ project.title }}
              </span>
            </div>
          </div>
          <!-- Star and more stay in the header next to the hamburger; from lg up they sit in the side column -->
          <div class="ml-4 flex shrink-0 items-center gap-1 lg:hidden">
            <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
            <button
              type="button"
              class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dark-500 text-white"
              :aria-expanded="isNavOpen"
              aria-controls="project-steps"
              aria-label="Project steps"
              @click="isNavOpen = !isNavOpen">
              <NuxtIcon :name="isNavOpen ? 'local:cross' : 'local:menu'" class="text-2xl" />
            </button>
          </div>
        </header>
        <div class="relative isolate mx-auto flex min-h-0 w-full grow flex-col overflow-hidden">
          <slot />
        </div>
      </div>

      <div v-if="isNavOpen" class="absolute inset-0 z-30 bg-black/50 lg:hidden" @click="isNavOpen = false" />

      <div
        id="project-steps"
        class="scrollbar-hidden absolute inset-y-0 right-0 z-40 flex w-64 shrink-0 flex-col items-center justify-between overflow-x-auto bg-dark-400 px-2 py-4 shadow-2xl transition-transform duration-300 md:gap-6 md:px-4 md:py-6 lg:static lg:w-auto lg:translate-x-0 lg:shadow-none"
        :class="isNavOpen ? 'translate-x-0' : 'translate-x-full'">
        <div class="hidden lg:block">
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
        </div>
        <LazyAppViewbar :project-id="projectId" :active-key="activeStep" hydrate-on-idle />
      </div>
    </main>
  </div>
</template>
