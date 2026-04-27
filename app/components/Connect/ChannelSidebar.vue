<script setup lang="ts">
defineProps<{
  conversations: {
    name: string
    msg: string
    time: string
    channel: string
    unread: number
    active?: boolean
  }[]
}>()
</script>

<template>
  <div class="flex flex-col bg-dark-400/20">
    <div class="grow overflow-y-auto">
      <div
        v-for="chat in conversations"
        :key="chat.name"
        :class="chat.active ? 'bg-dark-500 ring-1 ring-inset ring-white/5' : 'hover:bg-dark-500/50'"
        class="group flex cursor-pointer items-start gap-3 border-b border-white/5 p-4 transition-all">
        <div class="relative">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold leading-none text-dark-400">
            {{ chat.name.charAt(0) }}
          </div>
          <div class="absolute -bottom-1 -right-1 rounded-full bg-dark-400 p-0.5">
            <div :class="chat.channel === 'whatsapp' ? 'bg-success-500 fill-black' : 'bg-primary-500 fill-white'" class="flex items-center justify-center rounded-full p-0.5 text-[12px]">
              <NuxtIcon :name="`local:${chat.channel}`" />
            </div>
          </div>
        </div>
        <div class="min-w-0 grow">
          <div class="flex items-center justify-between">
            <h4 class="truncate text-sm font-semi-bold text-white">{{ chat.name }}</h4>
            <span class="text-[10px] text-white">{{ chat.time }}</span>
          </div>
          <p class="mt-1 truncate text-xs text-white">{{ chat.msg }}</p>
        </div>
        <div v-if="chat.unread" class="flex size-4 items-center justify-center rounded-full bg-dark-600 text-[10px] text-white">
          {{ chat.unread }}
        </div>
      </div>
    </div>
  </div>
</template>
ChannelMessage.vue
