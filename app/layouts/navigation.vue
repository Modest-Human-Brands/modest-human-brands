<script setup lang="ts">
const { user } = useUserSession()
const { data: organizationData } = await useFetch(`/api/organization/${user.value?.organizations[0]}`)

const organization = computed(() => organizationData.value ?? DEFAULT_ORG)
const route = useRoute()
const editedAt = 'Jan 17'
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })

const activeTab = computed(() => PRIMARY_NAVIGATION_TABS.find(({ id }) => route.path.includes(id)) ?? PRIMARY_NAVIGATION_TABS[0]!)

const dynamicBreadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter((p) => p)
  const crumbs: { label: string; to: string; icon?: string }[] = []
  let pathAccumulator = ''

  pathSegments.forEach((segment, index) => {
    pathAccumulator += `/${segment}`

    const matchingTab = PRIMARY_NAVIGATION_TABS.find((t) => t.id === segment)

    if (matchingTab) {
      crumbs.push({
        label: matchingTab.title,
        to: `/${matchingTab.id}`,
        icon: matchingTab.icon,
      })
    } else {
      const formattedLabel = segment
        .split('-')
        .filter((word) => isNaN(Number(word)))
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\d+$/, '')
        .trim()

      crumbs.push({
        label: formattedLabel || segment,
        to: pathAccumulator,
        icon: index === 0 ? 'ph:folder' : undefined,
      })
    }
  })

  return crumbs
})
</script>

<template>
  <div class="flex h-screen w-screen items-start justify-start bg-dark-400">
    <LazyAppNavbar :organization-name="organization.name" :organization-logo="organization.branding.logo" :active-key="activeTab.id" hydrate-on-idle />

    <main class="relative isolate mx-auto flex h-screen w-full grow flex-col overflow-hidden">
      <div class="scrollbar-hidden flex shrink-0 items-center justify-between overflow-x-auto px-2 py-4 pr-4 md:gap-6 md:px-4 md:py-6 md:pr-6">
        <AppBreadcrumb :items="dynamicBreadcrumbs" />
        <div class="flex shrink-0 flex-col items-end gap-2 md:gap-3">
          <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
        </div>
      </div>

      <div class="min-h-0 grow overflow-hidden">
        <slot />
      </div>
    </main>
  </div>
</template>
