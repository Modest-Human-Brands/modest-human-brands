<script setup lang="ts">
interface Conversation {
  name: string
  msg: string
  time: string
  channel: string
  unread: number
  active?: boolean
}

definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

/**
 * Global View State
 */
const activeTab = ref<'lead' | 'channel'>('lead')

/**
 * Lead View (Kanban) Logic
 */
const { data: connects, pending } = await useFetch<Connect[]>('/api/connect')
const selectedConnect = ref<Connect | null>(null)
const statuses = reactive(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted'])

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

/**
 * Channel View (Inbox) Logic
 */
const activeChatContact = reactive({
  name: 'Sarah Liu',
  initial: 'W',
  status: 'Contacted',
  role: 'Marketing Manager at WaveLength Creative Co.',
})

const conversations = reactive<Conversation[]>([
  { name: 'Sarah Liu', msg: "Sure, let's schedule a quick call.", time: '10:33 AM', channel: 'whatsapp', unread: 2, active: true },
  { name: 'Daniel Abu', msg: 'Re: Project Requirements', time: '9:15 AM', channel: 'email', unread: 1 },
  { name: 'Riri Rora', msg: 'Thanks for reaching out! 🙌', time: 'Yesterday', channel: 'instagram', unread: 1 },
])
</script>

<template>
  <section class="flex min-h-0 grow flex-col overflow-hidden py-1 md:py-2">
    <header class="flex shrink-0 items-center justify-start gap-8 border-t border-white/10 px-4 py-4">
      <button class="relative pb-2 text-sm font-semi-bold transition-colors" :class="activeTab === 'lead' ? 'text-white' : 'text-white hover:text-white'" @click="activeTab = 'lead'">
        Lead View
        <div v-if="activeTab === 'lead'" class="absolute bottom-0 h-0.5 w-full bg-white" />
      </button>
      <button class="relative pb-2 text-sm font-semi-bold transition-colors" :class="activeTab === 'channel' ? 'text-white' : 'text-white hover:text-white'" @click="activeTab = 'channel'">
        Channel View
        <div v-if="activeTab === 'channel'" class="absolute bottom-0 h-0.5 w-full bg-white" />
      </button>
    </header>

    <div class="flex min-h-0 grow flex-col border-t border-white/10">
      <div v-if="activeTab === 'lead'" class="flex h-full flex-col">
        <div class="grow overflow-auto px-2 py-6 md:px-4" @click.self="selectedConnect = null">
          <div v-if="pending" class="flex gap-6">
            <div v-for="i in 5" :key="i" class="h-[600px] w-72 shrink-0 animate-pulse rounded-2xl bg-dark-500/50" />
          </div>

          <div v-else class="flex items-start gap-6">
            <ConnectLeadColumn v-for="status in statuses" :key="status" :title="status" :connects="groupedConnects[status] || []" class="w-72 shrink-0" @select-connect="selectedConnect = $event" />
          </div>
        </div>

        <Transition name="slide">
          <DrawerConnectDetail v-if="selectedConnect" :key="selectedConnect.id" :connect="selectedConnect" @close="selectedConnect = null" />
        </Transition>
      </div>

      <div v-else class="flex min-h-0 flex-col md:flex-row">
        <ConnectChannelChatWindow class="order-2 grow md:order-1" :contact="activeChatContact" />

        <ConnectChannelSidebar class="order-1 w-full border-t border-white/5 md:order-2 md:w-80 md:border-l md:border-t-0" :conversations="conversations" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
