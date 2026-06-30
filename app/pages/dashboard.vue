<script setup lang="ts">
definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const { user } = useUserSession()

const now = useNow()
const currentDate = useDateFormat(now, 'dddd, MMMM D, YYYY')

const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const metrics = [
  { label: 'Active Contacts', value: '142', trend: '+12%', icon: 'local:person', color: 'text-primary-400' },
  { label: 'Unread Messages', value: '8', trend: '-2', icon: 'local:chat', color: 'text-alert-500' },
  { label: 'Ongoing Projects', value: '12', trend: 'Steady', icon: 'local:kanban', color: 'text-success-500' },
]

// MDoc Mock Data
const recentDocs = [
  { id: 1, title: 'Q3 Marketing Strategy', type: 'doc', updated: '2 hours ago', icon: 'local:document' },
  { id: 2, title: 'Client Onboarding Template', type: 'template', updated: '1 day ago', icon: 'local:kanban' },
  { id: 3, title: 'Brand Guidelines 2026', type: 'pdf', updated: '3 days ago', icon: 'local:document' },
]

// Connect Mock Data
const recentActivity = [
  { id: 1, type: 'email', title: 'Quotation Approved', name: 'RED CAT PICTURES', time: '10 mins ago', icon: 'local:email' },
  { id: 2, type: 'whatsapp', title: 'Checking on the timeline', name: 'Shreeja Sarkar', time: '1 hour ago', icon: 'local:whatsapp' },
  { id: 3, type: 'phone', title: 'Incoming Call (5m 12s)', name: 'Thekuya Factory', time: '3 hours ago', icon: 'local:phone' },
]

// Coordinate Mock Data
const activeRooms = [
  { id: 1, name: 'RED CAT PICTURES Sync', context: 'Team Room', time: '10m', initial: 'R' },
  { id: 2, name: 'GFT Talent Hunt', context: 'Project', time: '1h', initial: 'G' },
  { id: 3, name: 'Internal Engineering', context: 'Dev', time: '2h', initial: 'I' },
]
</script>

<template>
  <main class="flex size-full flex-col overflow-y-auto bg-dark-400 p-6 md:p-10">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <header class="flex flex-col justify-center gap-1 text-center">
        <h1 class="text-2xl font-semi-bold text-white md:text-3xl">{{ greeting }}, {{ user?.name.split(' ')[0] || 'there' }}</h1>
        <p class="font-medium text-sm text-light-500 md:text-base">{{ currentDate }}</p>
      </header>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div v-for="metric in metrics" :key="metric.label" class="flex items-center gap-4 rounded-2xl border border-dark-500 bg-dark-500/50 p-6 transition-all hover:bg-dark-500">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-dark-600">
            <NuxtIcon :name="metric.icon" class="text-xl" :class="metric.color" />
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-semi-bold text-white">{{ metric.value }}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semi-bold text-light-500">{{ metric.label }}</span>
              <span class="text-xs font-semi-bold" :class="metric.trend.startsWith('+') ? 'text-success-500' : 'text-light-600'">{{ metric.trend }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div class="flex flex-col gap-8 lg:col-span-2">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-semi-bold text-white">Recently Visited Docs</h2>
              <NuxtLink to="/doc" class="text-sm font-semi-bold text-light-500 transition-colors hover:text-white">View Doc </NuxtLink>
            </div>
            <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div v-for="doc in recentDocs" :key="doc.id" class="group flex cursor-pointer flex-col gap-3 rounded-xl border border-dark-500 bg-dark-500/30 p-4 transition-colors hover:bg-dark-500">
                <NuxtIcon :name="doc.icon" class="text-2xl text-light-400 transition-colors group-hover:text-white" />
                <div class="flex flex-col">
                  <span class="truncate text-sm font-semi-bold text-white">{{ doc.title }}</span>
                  <span class="font-medium text-xs text-light-600">{{ doc.updated }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between px-1">
              <h2 class="text-base font-semi-bold text-white">Recent Activity</h2>
              <NuxtLink to="/connect" class="text-sm font-semi-bold text-light-500 transition-colors hover:text-white"> View Connect</NuxtLink>
            </div>
            <div class="flex flex-col">
              <div v-for="act in recentActivity" :key="act.id" class="group flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-dark-500">
                <div class="flex size-9 items-center justify-center rounded-md bg-dark-500 transition-colors group-hover:bg-dark-400">
                  <NuxtIcon :name="act.icon" class="text-base text-white/80" />
                </div>
                <div class="flex flex-1 flex-col">
                  <span class="text-sm font-semi-bold text-white/90">{{ act.name }}</span>
                  <span class="text-sm text-light-500">{{ act.title }}</span>
                </div>
                <span class="text-xs font-semi-bold text-light-600">{{ act.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-base font-semi-bold text-white">Active Rooms</h2>
            <NuxtLink to="/coordinate" class="text-sm font-semi-bold text-light-500 transition-colors hover:text-white"> View Coordinate</NuxtLink>
          </div>
          <div class="flex flex-col">
            <div v-for="room in activeRooms" :key="room.id" class="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-dark-500">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semi-bold text-dark-500">
                {{ room.initial }}
              </div>
              <div class="flex min-w-0 flex-1 flex-col">
                <span class="truncate text-sm font-semi-bold text-white/90">{{ room.name }}</span>
                <span class="text-xs text-light-500">{{ room.context }}</span>
              </div>
              <span class="shrink-0 text-xs text-light-600">{{ room.time }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
