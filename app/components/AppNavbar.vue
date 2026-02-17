<script setup lang="ts">
type NavItem = {
  id: string
  label: string
  icon: string
  to: string
}

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

const isDesktop = useMediaQuery('(min-width: 768px)')

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
  <aside class="z-50 flex h-screen shrink-0 flex-col gap-4 overflow-hidden border-r border-white/10 bg-dark-400 px-2 py-6 text-white transition-all duration-300">
    <!-- Brand -->
    <div class="flex items-center gap-3">
      <div class="grid shrink-0 place-items-center rounded-full transition-transform hover:scale-110">
        <NuxtIcon name="local:logo" class="text-[32px] text-white md:text-[36px]" />
      </div>
      <Transition name="fade-slide">
        <div v-if="isDesktop" class="font-semibold min-w-0 overflow-hidden truncate text-sm">
          {{ brand }}
        </div>
      </Transition>
    </div>
    <!-- Navigation -->
    <nav class="grow">
      <!-- Primary -->
      <div class="space-y-2 border-t border-white/10 pt-3 md:space-y-3">
        <NuxtLink v-for="item in primary" :key="item.id" :to="item.to" :class="itemClass(item.id)" class="group relative flex items-center gap-3 rounded-xl p-2 text-base transition-all">
          <div class="grid shrink-0 place-items-center">
            <NuxtIcon :name="item.icon" class="text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
          </div>
          <Transition name="fade-slide">
            <span v-if="isDesktop" class="truncate">
              {{ item.label }}
            </span>
          </Transition>
          <span v-if="isActive(item.id) && isDesktop" class="animate-slide-in ml-auto h-4 w-1 rounded-full bg-primary-500" />
          <div v-if="isActive(item.id) && !isDesktop" class="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary-500" />
        </NuxtLink>
      </div>
      <!-- Secondary -->
      <div class="mt-6 space-y-2 border-t border-white/10 pt-3 md:space-y-3">
        <NuxtLink v-for="item in secondary" :key="item.id" :to="item.to" :class="itemClass(item.id)" class="group relative flex items-center gap-3 rounded-xl p-2 text-base transition-all">
          <div class="grid shrink-0 place-items-center">
            <NuxtIcon :name="item.icon" class="text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
          </div>
          <Transition name="fade-slide">
            <span v-if="isDesktop" class="truncate">
              {{ item.label }}
            </span>
          </Transition>
          <span v-if="isActive(item.id) && isDesktop" class="animate-slide-in ml-auto h-4 w-[3px] rounded-full bg-primary-500" />
          <div v-if="isActive(item.id) && !isDesktop" class="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary-500" />
          <div
            v-if="!isDesktop"
            class="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark-500 px-3 py-2 text-sm opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {{ item.label }}
          </div>
        </NuxtLink>
      </div>
    </nav>
    <!-- Settings -->
    <div class="">
      <NuxtLink to="/settings" :class="itemClass('settings')" class="group relative flex items-center gap-3 rounded-xl p-2 text-base transition-all">
        <div class="grid shrink-0 place-items-center">
          <NuxtIcon name="local:gear" class="text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
        </div>
        <Transition name="fade-slide">
          <span v-if="isDesktop" class="truncate"> Settings </span>
        </Transition>
        <span v-if="isActive('settings') && isDesktop" class="animate-slide-in ml-auto h-4 w-[3px] rounded-full bg-primary-500" />
        <div v-if="isActive('settings') && !isDesktop" class="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary-500" />
        <div
          v-if="!isDesktop"
          class="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-dark-500 px-3 py-2 text-sm opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Settings
        </div>
      </NuxtLink>
    </div>
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
