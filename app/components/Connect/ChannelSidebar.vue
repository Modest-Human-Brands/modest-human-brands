<script setup lang="ts">
defineProps<{
  activeContacts: Contact[]
}>()

const emit = defineEmits<{
  update: [id: string]
}>()
</script>

<template>
  <div class="flex flex-col bg-dark-400/20">
    <div class="grow overflow-y-auto">
      <button
        v-for="{ id, conversations } in activeContacts"
        :key="id"
        :class="conversations.at(-1)!.active ? 'bg-dark-500 ring-1 ring-inset ring-white/5' : 'hover:bg-dark-500/50'"
        class="group flex w-full cursor-pointer items-start gap-3 border-b border-white/5 p-4 transition-all"
        @click="emit('update', id)">
        <div class="relative">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold leading-none text-dark-400">
            {{ conversations.at(-1)!.name.charAt(0) }}
          </div>
          <div class="absolute -bottom-1 -right-1 rounded-full bg-dark-400 p-0.5">
            <div
              :class="conversations.at(-1)!.channel === 'whatsapp' ? 'bg-success-500 fill-black' : 'bg-primary-500 fill-white'"
              class="flex items-center justify-center rounded-full p-0.5 text-[12px]">
              <NuxtIcon :name="`local:${conversations.at(-1)!.channel}`" />
            </div>
          </div>
        </div>
        <div class="min-w-0 grow">
          <div class="flex items-center justify-between">
            <h4 class="truncate text-sm font-semi-bold text-white">{{ conversations.at(-1)!.name }}</h4>
            <span class="text-[10px] text-white">{{ conversations.at(-1)!.time }}</span>
          </div>
          <p class="mt-1 truncate text-left text-xs text-white">{{ conversations.at(-1)!.msg }}</p>
        </div>
        <div v-if="conversations.at(-1)!.unread" class="flex size-4 items-center justify-center rounded-full bg-dark-600 text-[10px] text-white">
          {{ conversations.at(-1)!.unread }}
        </div>
      </button>
    </div>
  </div>
</template>
