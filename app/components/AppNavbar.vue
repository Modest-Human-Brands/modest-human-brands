<script setup lang="ts">
const { user } = useUserSession()

const selectedOrg = ref(user.value?.organizations?.[0]?.orgId)
const isDropdownOpen = ref(false)

watch(
  () => user.value?.organizations?.[0]?.orgId,
  (newOrgId) => {
    if (!selectedOrg.value && newOrgId) {
      selectedOrg.value = newOrgId
    }
  }
)

const { data: organizationData } = await useFetch(() => `/api/organization/${selectedOrg.value}`)
const organization = computed(() => organizationData.value ?? DEFAULT_ORG)

withDefaults(
  defineProps<{
    activeKey?: string
  }>(),
  {
    activeKey: 'dashboard',
  }
)

const navGroups: NavItem[][] = [PRIMARY_NAVIGATION_TABS, SECONDARY_NAVIGATION_TABS]

function selectOrg(orgId: string) {
  selectedOrg.value = orgId
  isDropdownOpen.value = false
}

// const settingsItem: NavItem = { id: 'settings', title: 'Settings', icon: 'local:gear', description: 'Manage all your account settings here', to: '/settings' }
</script>

<template>
  <aside class="z-50 flex h-screen shrink-0 flex-col gap-4 border-r border-white/10 bg-dark-400 px-2 py-6 text-white transition-all duration-300">
    <!-- Brand -->
    <div class="relative">
      <button type="button" class="flex w-full items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-white/5" @click="isDropdownOpen = !isDropdownOpen">
        <div class="grid shrink-0 place-items-center rounded-full transition-transform hover:scale-110">
          <NuxtImg :src="organization.branding.logo" :alt="organization.name" class="relative size-8 object-contain" />
        </div>
        <div class="hidden min-w-0 flex-1 overflow-hidden truncate text-sm font-semi-bold md:block">
          {{ organization.name }}
        </div>
        <NuxtIcon name="local:chevron-bold" class="hidden size-4 shrink-0 -rotate-90 fill-white/50 transition-transform duration-200 md:block" :class="{ 'rotate-90': isDropdownOpen }" />
      </button>

      <div v-if="isDropdownOpen" class="fixed inset-0 z-40" @click="isDropdownOpen = false" />

      <div
        v-if="isDropdownOpen"
        class="absolute left-full top-0 z-50 ml-2 flex max-h-60 w-48 flex-col gap-2 overflow-y-auto rounded-md border border-white/10 bg-dark-400 shadow-xl md:left-0 md:top-full md:ml-0 md:mt-2 md:w-56">
        <button
          v-for="org in user?.organizations"
          :key="org.orgId"
          type="button"
          class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
          :class="org.orgId === selectedOrg ? 'bg-white/10 text-white' : 'text-white/70'"
          @click="selectOrg(org.orgId)">
          <div class="flex min-w-0 items-center gap-2">
            <NuxtImg v-if="org.orgLogo" :src="org.orgLogo" :alt="org.orgName" class="size-5 shrink-0 rounded-full object-contain" />
            <div v-else class="size-5 shrink-0 rounded-full bg-white/10" />
            <span class="truncate">{{ org.orgName }}</span>
          </div>
        </button>
      </div>
    </div>
    <!-- Navigation -->
    <nav class="grow overflow-y-auto">
      <div v-for="(group, i) in navGroups" :key="i" class="space-y-2 border-t border-white/10 pt-3 md:space-y-3" :class="{ 'mt-6': i > 0 }">
        <NuxtLink
          v-for="item in group"
          :key="item.id"
          :to="item.to"
          class="group relative flex items-center gap-3 rounded-xl p-2 text-base transition-all md:w-56"
          :class="item.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'"
          replace>
          <NuxtIcon :name="item.icon" class="shrink-0 text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
          <span class="hidden truncate md:block">{{ item.title }}</span>
          <span v-if="item.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-accent-500 md:block" />
          <span v-if="item.id === activeKey" class="absolute -right-1 top-1/2 ml-auto h-4 w-1 -translate-y-1/2 rounded-full bg-accent-500 md:hidden" />
        </NuxtLink>
      </div>
    </nav>
    <!-- Settings -->
    <!-- <NuxtLink
      :to="settingsItem.to"
      class="group relative flex items-center gap-3 rounded-xl p-2 text-base transition-all"
      :class="settingsItem.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'">
      <NuxtIcon :name="settingsItem.icon" class="shrink-0 text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
      <span class="hidden truncate md:block">{{ settingsItem.title }}</span>
      <span v-if="settingsItem.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-accent-500 md:block" />
      <span v-if="settingsItem.id === activeKey" class="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-accent-500 md:hidden" />
      <div
        class="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark-500 px-3 py-2 text-sm opacity-0  transition-opacity group-hover:opacity-100 md:hidden">
        {{ settingsItem.title }}
      </div>
    </NuxtLink> -->
  </aside>
</template>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(-4px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
