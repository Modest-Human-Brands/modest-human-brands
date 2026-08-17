<script setup lang="ts">
withDefaults(
  defineProps<{
    activeKey?: string
  }>(),
  {
    activeKey: 'plan',
  }
)

const emit = defineEmits<{
  select: [key: string]
}>()

type ViewItem = {
  id: string
  title: string
  icon: string
  children?: ViewItem[]
}

const viewGroups: ViewItem[] = [
  { id: 'plan', title: 'Plan', icon: 'local:target' },
  { id: 'crew-main', title: 'Crew', icon: 'local:person' },
  { id: 'documents', title: 'Documents', icon: 'local:document' },
  {
    id: 'pre-production',
    title: 'Pre Production',
    icon: 'local:calendar',
    children: [
      { id: 'scriptwriter', title: 'Scriptwriter', icon: 'local:journal' },
      { id: 'storyboard', title: 'Storyboard Artist', icon: 'local:kanban' },
      { id: 'mua', title: 'MUA/Hair/Stylists', icon: 'local:person' },
      { id: 'studio', title: 'Studio', icon: 'local:hard-drive' },
      { id: 'talent', title: 'Talent', icon: 'local:person' },
      { id: 'crew-sub', title: 'Crew', icon: 'local:person' },
      { id: 'editor', title: 'Editor', icon: 'local:stream' },
    ],
  },
  { id: 'production', title: 'Production', icon: 'local:node' },
  { id: 'post-production', title: 'Post Production', icon: 'local:stream' },
]
</script>

<template>
  <aside class="z-50 flex h-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-white/10 bg-dark-400 px-2 py-6 text-white transition-all duration-300 lg:border-l lg:border-t-0">
    <nav class="flex grow flex-col gap-2 md:gap-3">
      <div v-for="(group, i) in viewGroups" :key="i" class="">
        <button
          type="button"
          class="group relative flex w-full items-center gap-3 rounded-xl p-2 text-left text-base transition-all md:w-56"
          :class="group.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'"
          @click="emit('select', group.id)">
          <NuxtIcon :name="group.icon" class="shrink-0 text-[28px] transition-transform group-hover:scale-110 md:text-[32px]" />
          <span class="truncate">{{ group.title }}</span>
          <span v-if="group.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-accent-500 md:block" />
          <span v-if="group.id === activeKey" class="absolute -left-1 top-1/2 ml-auto h-4 w-1 -translate-y-1/2 rounded-full bg-accent-500 md:hidden" />
        </button>
        <div v-if="group.children && group.children.length > 0" class="my-2 ml-4 flex flex-col gap-2 md:my-3 md:ml-5 md:gap-3">
          <button
            v-for="subItem in group.children"
            :key="subItem.id"
            type="button"
            class="group relative flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm font-semi-bold transition-all md:w-48"
            :class="subItem.id === activeKey ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'"
            @click="emit('select', subItem.id)">
            <NuxtIcon :name="subItem.icon" class="shrink-0 text-2xl transition-transform group-hover:scale-110 md:text-[26px]" />
            <span class="truncate">{{ subItem.title }}</span>
            <span v-if="subItem.id === activeKey" class="animate-slide-in ml-auto hidden h-4 w-1 rounded-full bg-accent-500 md:block" />
            <span v-if="subItem.id === activeKey" class="absolute -left-1 top-1/2 ml-auto h-4 w-1 -translate-y-1/2 rounded-full bg-accent-500 md:hidden" />
          </button>
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
