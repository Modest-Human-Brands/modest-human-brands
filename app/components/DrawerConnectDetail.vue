<script setup lang="ts">
import type { Connect } from '~/types/connect'

defineProps<{ connect: Connect }>()
defineEmits(['close'])

type Tab = 'Details' | 'Conversations' | 'Activities'
const activeTab = ref<Tab>('Details')

const fields = {
  name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  jobTitle: 'Job Title',
}

const messages = [
  { id: 1, sender: 'Sarah Liu', time: '10:30 AM', text: "Hi! I'm looking for a new branding solution for our company.", isMe: false },
  { id: 2, sender: 'You', time: '10:32 AM', text: "Hi Sarah! That's great to hear. Can you tell me more about your requirements?", isMe: true },
  { id: 3, sender: 'Sarah Liu', time: '10:33 AM', text: "Sure, let's schedule a quick call.", isMe: false },
]

const activities = [
  { id: 1, type: 'status', title: 'Status updated to Contacted', time: '2 mins ago' },
  { id: 2, type: 'message', title: 'Received WhatsApp message', time: '1h ago' },
  { id: 3, type: 'call', title: 'Missed call from Sarah', time: 'Yesterday' },
]
</script>

<template>
  <div class="flex h-full w-[450px] flex-col border-l border-dark-600 bg-dark-400 font-main">
    <div class="p-6 pb-0">
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-dark-600 text-lg font-bold text-white">
            {{ connect.name[0] }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-white">{{ connect.name }}</h2>
              <span class="rounded bg-success-600/20 px-2 py-0.5 text-3xs font-bold uppercase text-success-500">
                {{ connect.status }}
              </span>
            </div>
            <p class="text-xs text-light-500">{{ connect.jobTitle }} at {{ connect.company }}</p>
          </div>
        </div>
        <button class="text-light-500 transition-colors hover:text-white" @click="$emit('close')">
          <NuxtIcon name="local:x-bold" class="text-xl" />
        </button>
      </div>

      <div class="mb-8 flex gap-3">
        <button
          v-for="icon in ['whatsapp', 'envelope-simple', 'phone', 'instagram']"
          :key="icon"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-600 bg-dark-500 text-light-500 transition-all hover:border-primary-500 hover:text-primary-400">
          <NuxtIcon :name="`local:${icon}`" />
        </button>
        <button class="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-600 bg-dark-500 text-light-500">
          <NuxtIcon name="local:dots-three" />
        </button>
      </div>

      <div class="flex border-b border-dark-600">
        <button
          v-for="tab in ['Details', 'Conversations', 'Activities'] as Tab[]"
          :key="tab"
          :class="['mr-6 pb-3 text-sm transition-colors', activeTab === tab ? 'border-b-2 border-primary-500 font-semi-bold text-white' : 'text-light-500 hover:text-light-600']"
          @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="activeTab === 'Details'" class="space-y-6">
        <div v-for="(label, key) in fields" :key="key">
          <p class="mb-1 text-3xs uppercase tracking-widest text-light-500">{{ label }}</p>
          <p class="text-sm font-light text-white">{{ connect[key as keyof Connect] || 'N/A' }}</p>
        </div>

        <div class="pt-4">
          <p class="mb-2 text-3xs uppercase tracking-widest text-light-500">Notes</p>
          <div class="rounded-lg border border-dark-600 bg-dark-500 p-3 text-sm text-light-600">Interested in rebranding and new website.</div>
        </div>
      </div>

      <div v-else-if="activeTab === 'Conversations'" class="flex h-full flex-col">
        <div class="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="filter in ['All', 'WhatsApp', 'Email', 'Instagram', 'Calls']"
            :key="filter"
            class="whitespace-nowrap rounded-full border border-dark-600 bg-dark-500 px-3 py-1 text-2xs text-light-500 hover:text-white">
            {{ filter }}
          </button>
        </div>

        <div class="flex-1 space-y-4">
          <div v-for="msg in messages" :key="msg.id" :class="['flex max-w-[85%] flex-col', msg.isMe ? 'ml-auto items-end' : 'items-start']">
            <div class="mb-1 flex items-center gap-2">
              <span class="text-3xs text-light-500">{{ msg.sender }}</span>
              <span class="text-3xs text-light-400">{{ msg.time }}</span>
            </div>
            <div :class="['rounded-2xl p-3 text-sm', msg.isMe ? 'rounded-tr-none bg-primary-600 text-white' : 'rounded-tl-none border border-dark-600 bg-dark-500 text-light-600']">
              {{ msg.text }}
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-2 rounded-xl border border-dark-600 bg-dark-500 p-2">
          <button class="p-2 text-light-500 hover:text-white">
            <NuxtIcon name="local:plus" />
          </button>
          <input type="text" placeholder="Type a message..." class="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-light-500" />
          <button class="rounded-lg bg-success-600 p-2 text-black">
            <NuxtIcon name="local:paper-plane" />
          </button>
        </div>
      </div>

      <div v-else-if="activeTab === 'Activities'" class="space-y-6">
        <div v-for="activity in activities" :key="activity.id" class="relative ml-2 border-l border-dark-600 pl-6">
          <div class="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-dark-400 bg-primary-500"></div>
          <p class="text-sm text-white">{{ activity.title }}</p>
          <p class="mt-1 text-3xs text-light-500">{{ activity.time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
