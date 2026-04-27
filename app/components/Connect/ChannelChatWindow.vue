<script setup lang="ts">
/**
 * Types and Interfaces
 */
interface Channel {
  name: string
  icon: string
}

interface Message {
  id: string
  senderName: string
  time: string
  text: string
  isOwn?: boolean
}

interface Contact {
  name: string
  initial: string
  status: string
  role: string
}

const props = defineProps<{
  contact: Contact
}>()

/**
 * State Management (Rule 4)
 */
const activeChannel = ref('All')

const channels = reactive<Channel[]>([
  { name: 'All', icon: 'local:chat' },
  { name: 'WhatsApp', icon: 'local:whatsapp' },
  { name: 'Email', icon: 'local:envelope' },
  { name: 'Instagram', icon: 'local:instagram' },
  { name: 'Calls', icon: 'local:phone' },
])

const messages = reactive<Message[]>([
  {
    id: 'm1',
    senderName: 'Sarah Liu',
    time: '10:30 AM',
    text: "Hi! I'm looking for a new branding solution for our company.",
    isOwn: false,
  },
  {
    id: 'm2',
    senderName: 'Me',
    time: '10:32 AM',
    text: "Hi Sarah! That's great to hear. Can you tell me more about your requirements?",
    isOwn: true,
  },
  {
    id: 'm3',
    senderName: 'Sarah Liu',
    time: '10:33 AM',
    text: "Sure, let's schedule a quick call.",
    isOwn: false,
  },
  {
    id: 'm4',
    senderName: 'Sarah Liu',
    time: '10:34 AM',
    text: 'Got it?',
    isOwn: false,
  },
])

const contactData = reactive({ ...props.contact })

/**
 * Actions
 */
function setActiveChannel(name: string) {
  activeChannel.value = name
}
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <header class="border-b border-white/5 p-2 md:p-4 md:pb-0">
      <div class="mb-6 flex items-center gap-4">
        <div class="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold leading-none text-dark-400">
          {{ contactData.initial }}
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-white md:text-xl">{{ contactData.name }}</h2>
            <span class="rounded bg-success-500/10 px-2 py-1 text-sm font-bold text-success-500">
              {{ contactData.status }}
            </span>
          </div>
          <p class="text-sm text-white">{{ contactData.role }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 pb-4 md:gap-3">
        <button
          v-for="channel in channels"
          :key="channel.name"
          :class="activeChannel === channel.name ? 'bg-dark-500 text-white ring-1 ring-white/10' : 'text-white hover:text-white'"
          class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semi-bold transition-all"
          @click="setActiveChannel(channel.name)">
          <NuxtIcon :name="channel.icon" />
          {{ channel.name }}
        </button>
      </div>
    </header>

    <div class="min-h-0 grow space-y-8 overflow-y-scroll p-2 md:p-4">
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-x-0 h-px bg-white/5" />
        <span class="relative bg-dark-400 px-4 text-sm font-bold uppercase tracking-widest text-white"> Today </span>
      </div>

      <div class="flex flex-col gap-8">
        <ConnectChannelMessage v-for="message in messages" :key="message.id" :sender-name="message.senderName" :time="message.time" :text="message.text" :is-own="message.isOwn" />
      </div>
    </div>

    <footer class="p-2 md:p-4 md:pt-0">
      <ConnectChannelInput />
    </footer>
  </div>
</template>
