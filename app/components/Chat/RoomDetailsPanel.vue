<script setup lang="ts">
const { activeMembers } = useChat()

const STATUS_LABEL: Record<string, string> = {
  online: 'Online',
  away: 'Away',
  dnd: 'Do not disturb',
  offline: 'Offline',
}

const STATUS_COLOR: Record<string, string> = {
  online: '#48FEA7',
  away: '#FFB83D',
  dnd: '#FF4444',
  offline: '#8D8D8D',
}

const ROLE_BG: Record<string, string> = {
  admin: 'bg-warning-400/15 text-warning-400 ring-warning-400/25',
  moderator: 'bg-primary-400/15 text-primary-400 ring-primary-400/25',
}

const searchQuery = ref('')
const showSearch = ref(false)
const searchRef = useTemplateRef<HTMLInputElement>('searchRef')

async function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    await nextTick()
    searchRef.value?.focus()
  } else {
    searchQuery.value = ''
  }
}

const filteredMembers = computed(() => activeMembers.value.filter((m) => !searchQuery.value || m.name.toLowerCase().includes(searchQuery.value.toLowerCase())))

const grouped = computed(() => {
  const order = ['online', 'away', 'dnd', 'offline']
  const groups: Record<string, ChatUser[]> = {}
  for (const status of order) {
    const members = filteredMembers.value.filter((m) => m.status === status)
    if (members.length) groups[status] = members
  }
  return groups
})

const showDetailsPanel = false
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-250 ease-out"
    enter-from-class="opacity-0 translate-x-3"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-3">
    <aside v-if="showDetailsPanel" class="hidden w-60 shrink-0 flex-col border-l border-white/10 lg:flex">
      <div class="flex items-center justify-between px-4 py-3">
        <span class="font-semibold text-sm text-white/50"> Members · {{ activeMembers.length }} </span>
        <div class="flex items-center gap-0.5">
          <button
            class="hover:bg-white/8 flex size-6 items-center justify-center rounded-lg transition-colors"
            :class="showSearch ? 'text-primary-400' : 'text-white/30 hover:text-white/60'"
            title="Search members"
            @click="toggleSearch">
            <NuxtIcon name="local:search" class="text-sm" />
          </button>
          <button class="hover:bg-white/8 flex size-6 items-center justify-center rounded-lg text-white/30 transition-colors hover:text-white/60" @click="showDetailsPanel = false">
            <NuxtIcon name="local:cross" class="text-sm" />
          </button>
        </div>
      </div>
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="showSearch" class="px-3 pb-2">
          <label class="ring-white/8 flex items-center gap-2 rounded-xl bg-dark-500/60 px-3 py-1.5 ring-1 focus-within:ring-primary-500/30">
            <NuxtIcon name="local:search" class="shrink-0 text-sm text-white/25" />
            <input ref="searchRef" v-model="searchQuery" type="text" placeholder="Find member…" class="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
          </label>
        </div>
      </Transition>
      <div class="scrollbar-hidden flex-1 overflow-y-auto px-2.5 pb-3">
        <template v-for="(members, status) in grouped" :key="status">
          <div class="mb-1.5 mt-4 flex items-center gap-1.5 px-1 first:mt-2">
            <span class="size-1.5 rounded-full" :style="{ backgroundColor: STATUS_COLOR[status as string] }" />
            <span class="text-xs font-bold uppercase tracking-widest text-white/25"> {{ STATUS_LABEL[status as string] }} · {{ members.length }} </span>
          </div>
          <div v-for="member in members" :key="member.id" class="group flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 transition-all duration-150 hover:bg-dark-600">
            <ChatUserAvatar :name="member.name" :status="member.status" size="md" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="font-semibold truncate text-sm text-white/75 transition-colors group-hover:text-white">
                  {{ member.name }}
                </span>
                <!-- Role pill -->
                <span v-if="member.role !== 'member'" class="shrink-0 rounded-full px-1.5 py-px text-xs font-bold ring-1" :class="ROLE_BG[member.role]">
                  {{ member.role }}
                </span>
              </div>
              <p class="truncate text-sm text-white/30">{{ member.title }}</p>
            </div>
            <div class="flex shrink-0 translate-x-2 items-center gap-0.5 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
              <button class="flex size-6 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Direct">
                <NuxtIcon name="local:chat" class="md:text-[20px text-[18px]" />
              </button>
              <button class="flex size-6 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white" title="Start call">
                <NuxtIcon name="local:phone" class="text-[18px] md:text-[20px]" />
              </button>
            </div>
          </div>
        </template>
        <div v-if="!Object.keys(grouped).length" class="flex flex-col items-center gap-2 py-10 text-center">
          <NuxtIcon name="local:search" class="text-2xl text-white/15" />
          <p class="text-sm text-white/25">No members found</p>
        </div>
      </div>
      <div class="border-t border-white/10 p-3">
        <button
          class="border-white/12 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm text-white/30 transition-all hover:border-white/25 hover:bg-dark-600 hover:text-white/60 active:scale-[0.98]">
          <NuxtIcon name="local:plus" class="text-sm" />
          Invite Members
        </button>
      </div>
    </aside>
  </Transition>
</template>
