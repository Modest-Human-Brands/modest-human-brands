<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    projectId: string
    activeKey?: string
  }>(),
  {
    activeKey: 'plan',
  }
)

const navGroups = computed<NavItem[]>(() => [
  { id: 'plan', title: 'Plan', icon: 'local:bulb', to: `/project/${props.projectId}/plan` },
  { id: 'crew', title: 'Crew', icon: 'local:people', to: `/project/${props.projectId}/crew` },
  { id: 'document', title: 'Document', icon: 'local:document', to: `/project/${props.projectId}/document` },
  {
    id: 'pre-production',
    title: 'Pre Production',
    icon: 'local:calendar',
    to: `/project/${props.projectId}/pre-production`,
    children: [
      { id: 'script', title: 'Script', icon: 'local:pen', to: `/project/${props.projectId}/pre-production/script` },
      { id: 'storyboard', title: 'Storyboard', icon: 'local:grid-1x2', to: `/project/${props.projectId}/pre-production/storyboard` },
      { id: 'look', title: 'Look', icon: 'local:color-palette', to: `/project/${props.projectId}/pre-production/look` },
      { id: 'setup', title: 'Setup', icon: 'local:warehouse', to: `/project/${props.projectId}/pre-production/setup` },
    ],
  },
  { id: 'production', title: 'Production', icon: 'local:clapperboard', to: `/project/${props.projectId}/production` },
  { id: 'post-production', title: 'Post Production', icon: 'local:scissors', to: `/project/${props.projectId}/post-production` },
])
</script>

<template>
  <aside class="z-50 flex h-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-white/10 bg-dark-400 px-2 py-6 text-white transition-all duration-300 lg:border-l lg:border-t-0">
    <nav class="flex grow flex-col gap-2 md:gap-3">
      <div v-for="group in navGroups" :key="group.id" class="">
        <NuxtLink
          :to="group.to"
          class="group relative flex w-full items-center gap-3 rounded-xl p-2 text-left text-base transition-all md:w-56"
          :class="group.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'">
          <NuxtIcon :name="group.icon" class="shrink-0 text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
          <span class="truncate">{{ group.title }}</span>
          <span v-if="group.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-accent-500 md:block" />
          <span v-if="group.id === activeKey" class="absolute -left-1 top-1/2 ml-auto h-4 w-1 -translate-y-1/2 rounded-full bg-accent-500 md:hidden" />
        </NuxtLink>
        <div v-if="group.children && group.children.length > 0" class="my-2 ml-4 flex flex-col gap-2 md:my-3 md:ml-5 md:gap-3">
          <NuxtLink
            v-for="subItem in group.children"
            :key="subItem.id"
            :to="group.to"
            class="group relative flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm font-semi-bold transition-all md:w-48"
            :class="subItem.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'">
            <NuxtIcon :name="subItem.icon" class="shrink-0 text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
            <span class="truncate">{{ subItem.title }}</span>
            <span v-if="subItem.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-accent-500 md:block" />
            <span v-if="subItem.id === activeKey" class="absolute -left-1 top-1/2 ml-auto h-4 w-1 -translate-y-1/2 rounded-full bg-accent-500 md:hidden" />
          </NuxtLink>
        </div>
      </div>
    </nav>
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
