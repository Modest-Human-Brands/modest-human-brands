<script setup lang="ts">
import type { Connect } from '~/types/connect'

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

// const { data: connects, pending } = await useFetch<Connect[]>('/api/connect')
const connects = ref([
  // --- NEW ---
  {
    id: '1',
    name: 'Aisha Khan',
    company: 'Brightside Inc.',
    lastActive: '3d ago',
    status: 'New',
    platforms: ['whatsapp', 'email'],
    jobTitle: 'Operations Manager',
    email: 'aisha@brightside.inc',
    phone: '+1 (555) 000-1111',
  },
  {
    id: '2',
    name: 'Neha Patel',
    company: 'Growth Hackers',
    lastActive: '4d ago',
    status: 'New',
    platforms: ['email'],
  },
  {
    id: '3',
    name: 'Rohan Mehta',
    company: 'Mehta & Co.',
    lastActive: '5d ago',
    status: 'New',
    platforms: ['call', 'instagram'],
  },

  // --- CONTACTED ---
  {
    id: '4',
    name: 'Sarah Liu',
    company: 'WaveLength Creative Co.',
    lastActive: '2m ago',
    status: 'Contacted',
    platforms: ['whatsapp', 'email', 'call', 'instagram'],
    jobTitle: 'Marketing Manager',
    email: 'sarah.liu@wavelength.co',
    phone: '+1 (555) 123-4567',
  },
  {
    id: '5',
    name: 'Daniel Abu',
    company: 'Project Horizon',
    lastActive: '15m ago',
    status: 'Contacted',
    platforms: ['email'],
  },
  {
    id: '6',
    name: 'Steve Laurent',
    company: 'Lunar Studios',
    lastActive: '1h ago',
    status: 'Contacted',
    platforms: ['instagram'],
  },

  // --- QUALIFIED ---
  {
    id: '7',
    name: 'Michael Tan',
    company: 'Streamline Corp',
    lastActive: '4d ago',
    status: 'Qualified',
    platforms: ['call', 'email'],
  },
  {
    id: '8',
    name: 'Daniel Lewis',
    company: 'Lewis Innovations',
    lastActive: '5d ago',
    status: 'Qualified',
    platforms: ['instagram'],
  },

  // --- PROPOSAL SENT ---
  {
    id: '9',
    name: 'Riri Rora',
    company: 'Pixel Perfect',
    lastActive: '3d ago',
    status: 'Proposal Sent',
    platforms: ['email'],
  },

  // --- CONVERTED ---
  {
    id: '10',
    name: 'Aditya Verma',
    company: 'Verma Solutions',
    lastActive: '1d ago',
    status: 'Converted',
    platforms: ['call'],
  },
])

const selectedConnect = ref<Connect | null>(null)

const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted']

const groupedConnects = computed(() => {
  if (!connects.value) return {}
  return connects.value.reduce(
    (acc, item) => {
      if (!acc[item.status]) acc[item.status] = []
      acc[item.status].push(item)
      return acc
    },
    {} as Record<string, Connect[]>
  )
})
</script>

<template>
  <section class="mt-2.5 flex h-full overflow-hidden border-t border-white/10">
    <div class="mx-2 flex-1 overflow-x-auto py-2 md:mx-4 md:py-4" @click.self="selectedConnect = null">
      <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
        <div v-for="i in 5" :key="i" class="h-full animate-pulse rounded-2xl bg-dark-500/50" />
      </div>

      <div v-else class="flex gap-4">
        <ConnectColumn v-for="status in statuses" :key="status" :title="status" :connects="groupedConnects[status] || []" @select-connect="selectedConnect = $event" />
      </div>
    </div>

    <Transition name="slide" mode="out-in">
      <DrawerConnectDetail v-if="selectedConnect" :key="selectedConnect" :connect="selectedConnect" @close="selectedConnect = null" />
    </Transition>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
