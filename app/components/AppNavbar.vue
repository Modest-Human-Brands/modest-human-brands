<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    brand?: string
    activeKey?: string
  }>(),
  {
    brand: 'Modest Human Brands',
    activeKey: 'dashboard',
  }
)

function itemClass(id: string) {
  const isActive = id === props.activeKey

  return isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
}

const primary: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'local:grid', to: '/dashboard' },
  { id: 'website', label: 'Website/App', icon: 'local:app', to: '/website-app' },
  { id: 'connect', label: 'Connect', icon: 'local:network', to: '/connect' },
  { id: 'doc', label: 'Doc', icon: 'local:document', to: '/doc' },
  { id: 'coordinate', label: 'Coordinate', icon: 'local:node', to: '/coordinate' },
  { id: 'sync', label: 'Sync', icon: 'local:stream', to: '/sync' },
  { id: 'drive', label: 'Drive', icon: 'local:hard-drive', to: '/drive' },
]

const secondary: NavItem[] = [
  { id: 'client', label: 'Client', icon: 'local:briefcase', to: '/client' },
  { id: 'project', label: 'Project', icon: 'local:target-fill', to: '/project' },
  { id: 'content', label: 'Content', icon: 'local:book', to: '/content' },
]

const isActive = (id: string) => id === props.activeKey
</script>

<template>
  <aside class="relative h-screen w-[260px] shrink-0 border-r border-white/10 bg-dark-400 text-white">
    <div class="flex items-center gap-3 px-5 py-5">
      <div class="grid h-9 w-9 place-items-center rounded-full bg-white/10">
        <NuxtIcon name="local:logo" class="text-lg" />
      </div>
      <div class="min-w-0">
        <div class="font-semibold truncate text-sm">
          {{ brand }}
        </div>
      </div>
    </div>
    <nav class="px-3">
      <div class="space-y-1">
        <NuxtLink v-for="item in primary" :key="item.id" :to="item.to" :class="itemClass(item.id)" class="group flex items-center gap-3 rounded-xl px-3 py-2 text-base transition">
          <NuxtIcon :name="item.icon" class="text-[2rem]" />
          <span class="truncate">{{ item.label }}</span>
          <span v-if="isActive(item.id)" class="ml-auto h-5 w-[3px] rounded-full bg-white/70" />
        </NuxtLink>
      </div>
      <div class="mt-6 border-t border-white/10 pt-4">
        <div class="space-y-1">
          <NuxtLink v-for="item in secondary" :key="item.id" :to="item.to" :class="itemClass(item.id)" class="group flex items-center gap-3 rounded-xl px-3 py-2 text-base transition">
            <NuxtIcon :name="item.icon" class="text-[2rem]" />
            <span class="truncate">{{ item.label }}</span>
            <span v-if="isActive(item.id)" class="ml-auto h-5 w-[3px] rounded-full bg-white/70" />
          </NuxtLink>
        </div>
      </div>
    </nav>
    <div class="absolute bottom-0 left-0 w-[260px] px-3 pb-4">
      <button type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white">
        <NuxtIcon name="local:gear" class="text-[2rem]" />
        <span class="truncate">Settings</span>
      </button>
    </div>
  </aside>
</template>
