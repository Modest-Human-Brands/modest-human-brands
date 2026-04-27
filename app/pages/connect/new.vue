<script lang="ts" setup>
interface Recipient {
  id: string
  name: string
  email: string
  isExisting: boolean
}

interface Channel {
  id: string
  name: string
  icon: string
}

definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const currentStep = ref(1)
const searchQuery = ref('')

const recipients = reactive<Recipient[]>([
  { id: '1', name: 'Jane Doe', email: 'jane.doe@example.com', isExisting: true },
  { id: '2', name: 'Alex Smith', email: 'alex.smith@example.com', isExisting: true },
  { id: '3', name: 'Robert Taylor', email: 'robert.taylor@example.com', isExisting: true },
])

const channels = reactive<Channel[]>([
  { id: 'email', name: 'Email', icon: 'local:envelope' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'local:whatsapp' },
  { id: 'sms', name: 'SMS', icon: 'local:chat' },
])

const selectedRecipientId = ref(null)
const selectedChannelId = ref(null)

const steps = reactive([
  { id: 1, label: 'Recipient' },
  { id: 2, label: 'Template' },
  { id: 3, label: 'Review & Send' },
])
</script>

<template>
  <div class="h-full overflow-y-auto p-2 md:p-4">
    <div class="mx-auto max-w-3xl px-4 py-8 md:px-0">
      <nav class="mb-12">
        <ol class="flex items-center justify-between">
          <li v-for="(step, index) in steps" :key="step.id" class="relative flex grow items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" :class="currentStep >= step.id ? 'bg-primary-500 text-white' : 'bg-dark-500 text-white'">
              {{ step.id }}
            </div>
            <span class="text-sm font-semi-bold" :class="currentStep >= step.id ? 'text-white' : 'text-white'">
              {{ step.label }}
            </span>
            <div v-if="index < steps.length - 1" class="mx-4 h-px grow bg-dark-600" />
          </li>
        </ol>
      </nav>

      <div class="flex flex-col gap-10">
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-bold">Choose Channel</h2>
            <p class="text-sm text-white">Select how you want to connect</p>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="channel in channels"
              :key="channel.id"
              class="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all"
              :class="selectedChannelId === channel.id ? 'border-primary-500 bg-dark-500' : 'border-dark-600 bg-dark-400'"
              @click="selectedChannelId = channel.id">
              <div class="flex items-center gap-4">
                <NuxtIcon :name="channel.icon" class="text-xl text-primary-500" />
                <span class="text-sm font-bold text-white">{{ channel.name }}</span>
              </div>
              <div class="flex h-5 w-5 items-center justify-center rounded-full border" :class="selectedChannelId === channel.id ? 'border-primary-500' : 'border-dark-600'">
                <div v-if="selectedChannelId === channel.id" class="h-2.5 w-2.5 rounded-full bg-primary-500" />
              </div>
            </div>
          </div>
        </section>

        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-bold">Select Recipient</h2>
            <p class="text-sm text-white">Choose whom you want to connect</p>
          </div>

          <div class="flex flex-col gap-4">
            <label class="text-sm font-semi-bold text-white">Add Recipient</label>
            <div class="flex items-center gap-2">
              <div class="relative grow">
                <NuxtIcon name="local:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search contacts by name or email"
                  class="w-full rounded-lg border border-dark-600 bg-dark-400 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white focus:border-primary-500 focus:outline-none" />
              </div>
              <button class="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-600 bg-dark-400 text-white hover:bg-dark-500">
                <NuxtIcon name="local:plus" />
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="person in recipients"
              :key="person.id"
              class="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all"
              :class="selectedRecipientId === person.id ? 'border-primary-500 bg-dark-500' : 'border-dark-600 bg-dark-400'"
              @click="selectedRecipientId = person.id">
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-dark-600 text-sm font-bold uppercase text-white">
                  {{
                    person.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                  }}
                </div>
                <div class="flex min-w-0 flex-col">
                  <span class="text-sm font-bold text-white">{{ person.name }}</span>
                  <span class="truncate text-sm text-white">{{ person.email }}</span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span v-if="person.isExisting" class="rounded bg-success-600/10 px-2 py-0.5 text-sm font-semi-bold text-success-600"> Existing </span>
                <div class="flex h-5 w-5 items-center justify-center rounded-full border" :class="selectedRecipientId === person.id ? 'border-primary-500' : 'border-dark-600'">
                  <div v-if="selectedRecipientId === person.id" class="h-2.5 w-2.5 rounded-full bg-primary-500" />
                </div>
              </div>
            </div>

            <button class="flex items-center justify-between rounded-xl border border-dark-600 bg-dark-400 p-4 transition-colors hover:bg-dark-500">
              <div class="flex items-center gap-4">
                <NuxtIcon name="local:person" class="text-xl text-white" />
                <div class="flex flex-col items-start">
                  <span class="text-sm font-bold text-white">Add New Contact</span>
                  <span class="text-sm text-white">Add a new recipient manually</span>
                </div>
              </div>
              <NuxtIcon name="local:chevron-bold" class="scale-[-1]" />
            </button>
          </div>
        </section>

        <footer class="flex justify-end">
          <button class="flex items-center gap-2 rounded-lg bg-white px-8 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95">
            Continue
            <NuxtIcon name="local:chevron-bold" class="scale-[-1] fill-black" />
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Resetting default input number spin buttons */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
