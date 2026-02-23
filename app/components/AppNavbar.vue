<script setup lang="ts">
type NavItem = {
  id: string
  label: string
  icon: string
  to: string
}

withDefaults(
  defineProps<{
    brand?: string
    activeKey?: string
  }>(),
  {
    brand: 'Modest Human Brands',
    activeKey: 'dashboard',
  }
)

const navGroups: NavItem[][] = [
  [
    { id: 'dashboard', label: 'Dashboard', icon: 'local:grid', to: '/dashboard' },
    { id: 'website', label: 'Website/App', icon: 'local:app', to: '/website-app' },
    { id: 'connect', label: 'Connect', icon: 'local:network', to: '/connect' },
    { id: 'doc', label: 'Doc', icon: 'local:document', to: '/doc' },
    { id: 'coordinate', label: 'Coordinate', icon: 'local:node', to: '/coordinate' },
    { id: 'sync', label: 'Sync', icon: 'local:stream', to: '/sync' },
    { id: 'drive', label: 'Drive', icon: 'local:hard-drive', to: '/drive' },
  ],
  [
    { id: 'client', label: 'Client', icon: 'local:briefcase', to: '/client' },
    { id: 'project', label: 'Project', icon: 'local:target-fill', to: '/project' },
    { id: 'content', label: 'Content', icon: 'local:book', to: '/content' },
  ],
]

const settingsItem: NavItem = { id: 'settings', label: 'Settings', icon: 'local:gear', to: '/settings' }
</script>

<template>
  <aside class="z-50 flex h-screen shrink-0 flex-col gap-4 overflow-hidden border-r border-white/10 bg-dark-400 px-2 py-6 text-white transition-all duration-300">
    <!-- Brand -->
    <div class="flex items-center gap-3">
      <div class="grid shrink-0 place-items-center rounded-full transition-transform hover:scale-110">
        <NuxtIcon name="local:logo" class="text-[32px] text-white md:text-[36px]" />
      </div>
      <div class="font-semibold hidden min-w-0 overflow-hidden truncate text-sm md:block">
        {{ brand }}
      </div>
    </div>

    <!-- Navigation -->
    <nav class="grow">
      <div v-for="(group, i) in navGroups" :key="i" class="space-y-2 border-t border-white/10 pt-3 md:space-y-3" :class="{ 'mt-6': i > 0 }">
        <NuxtLink
          v-for="item in group"
          :key="item.id"
          :to="item.to"
          class="group relative flex items-center gap-3 rounded-xl p-2 text-base transition-all"
          :class="item.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'">
          <NuxtIcon :name="item.icon" class="shrink-0 text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
          <span class="hidden truncate md:block">{{ item.label }}</span>
          <span v-if="item.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-primary-500 md:block" />
          <span v-if="item.id === activeKey" class="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary-500 md:hidden" />
          <div
            class="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark-500 px-3 py-2 text-sm opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:hidden">
            {{ item.label }}
          </div>
        </NuxtLink>
      </div>
    </nav>

    <!-- Settings -->
    <NuxtLink
      :to="settingsItem.to"
      class="group relative flex items-center gap-3 rounded-xl p-2 text-base transition-all"
      :class="settingsItem.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'">
      <NuxtIcon :name="settingsItem.icon" class="shrink-0 text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
      <span class="hidden truncate md:block">{{ settingsItem.label }}</span>
      <span v-if="settingsItem.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-primary-500 md:block" />
      <span v-if="settingsItem.id === activeKey" class="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary-500 md:hidden" />
      <div
        class="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark-500 px-3 py-2 text-sm opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:hidden">
        {{ settingsItem.label }}
      </div>
    </NuxtLink>
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
