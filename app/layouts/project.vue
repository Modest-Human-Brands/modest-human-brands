<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId as string

const { data: project } = await useFetch(`/api/project/${projectId}`)

const editedAt = 'Jan 17'
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })

const activeTab = computed(() => PRIMARY_NAVIGATION_TABS.find(({ id }) => route.path.includes(id)) ?? PRIMARY_NAVIGATION_TABS[0]!)
</script>

<template>
  <div class="flex h-dvh w-screen items-start justify-start bg-dark-400">
    <LazyAppNavbar :active-key="activeTab.id" hydrate-on-idle />

    <main class="relative isolate mx-auto flex h-dvh w-full grow overflow-hidden">
      <div class="min-h-0 grow overflow-hidden">
        <header class="scrollbar-hidden flex shrink-0 items-center justify-between overflow-x-auto px-4 py-4 md:px-8">
          <div class="flex items-center gap-4">
            <NuxtIcon name="local:target" class="text-4xl" />
            <div class="flex flex-col">
              <span class="d:text-2xl w-full whitespace-nowrap text-xl">
                {{ project.title }}
              </span>
            </div>
          </div>
        </header>
        <div class="relative isolate mx-auto flex h-dvh w-full grow flex-col overflow-hidden">
          <slot />
        </div>
      </div>

      <div class="scrollbar-hidden flex shrink-0 flex-col items-center justify-between overflow-x-auto px-2 py-4 md:gap-6 md:px-4 md:py-6">
        <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
        <LazyAppViewbar :project-id="projectId" :active-key="activeTab.id" hydrate-on-idle />
      </div>
    </main>
  </div>
</template>
