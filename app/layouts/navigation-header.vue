<script setup lang="ts">
const { emitAction } = useLayoutActions()
const route = useRoute()

const { user } = useUserSession()
const { data: organizationData } = await useFetch(`/api/organization/${user.value?.organizations[0]}`)

const organization = computed(() => organizationData.value ?? DEFAULT_ORG)

const editedAt = ref('Jan 17')
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })

const activeTab = computed(() => PRIMARY_NAVIGATION_TABS.find(({ id }) => route.path.includes(id)) ?? PRIMARY_NAVIGATION_TABS[0]!)
</script>

<template>
  <div class="flex h-screen w-screen items-start justify-start bg-dark-400 text-white">
    <LazyAppNavbar :organization-name="organization.name" :organization-logo="organization.branding.logo" :active-key="activeTab.id" hydrate-on-idle />

    <main class="relative isolate mx-auto flex h-screen w-full grow flex-col overflow-hidden">
      <div class="flex shrink-0 items-start justify-between px-2 pr-4 pt-6 md:gap-6 md:px-4 md:pr-6">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-4">
            <NuxtIcon :name="activeTab.icon" class="text-4xl md:text-5xl" />
            <h1 class="hidden text-3xl font-bold tracking-tight md:inline">
              {{ activeTab.title }}
            </h1>
          </div>
          <p class="hidden text-sm text-white md:inline">
            {{ activeTab.description }}
          </p>
        </div>

        <div class="scrollbar-hidden flex shrink-0 flex-col items-end gap-3 overflow-x-auto">
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators || []" />
          <AppActionbar @create="emitAction('create', { type: activeTab.id, source: 'top-bar' })" />
        </div>
      </div>

      <div class="min-h-0 grow">
        <slot />
      </div>
    </main>
  </div>
</template>
