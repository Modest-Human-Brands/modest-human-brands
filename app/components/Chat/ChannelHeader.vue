<script setup lang="ts">
const { state, activeRoom, activeChannel, activeMembers, selectChannel } = useChat()

const CHANNEL_ICONS: Record<string, string> = {
  text: 'local:chat',
  voice: 'local:microphone',
  video: 'local:camera',
  location: 'local:map',
}

const onlineCount = computed(() => activeMembers.value.filter((m) => m.status === 'online').length)
const dmPartner = computed(() => (activeRoom.value?.type === 'dm' ? activeMembers.value.find((m) => m.id !== state.currentUserId) : null))

const hasMultiChannel = computed(() => (activeRoom.value?.channels.length ?? 0) > 1)
</script>

<template>
  <header class="shrink-0 border-b border-white/10 bg-dark-500/20">
    <div class="flex items-center gap-3 px-4 py-2.5">
      <div class="flex min-w-0 flex-1 items-center gap-2.5">
        <div class="shrink-0">
          <div v-if="activeRoom && activeRoom?.type !== 'dm'" class="flex size-11 select-none items-center justify-center rounded-full bg-dark-500 text-lg font-bold uppercase leading-none text-white">
            <NuxtImg v-if="activeRoom.logo" :src="activeRoom.logo" :alt="activeRoom.name" class="relative size-[28px] object-contain" />
            <span v-else>
              {{ activeRoom.name.at(0) }}
            </span>
          </div>
          <ChatUserAvatar v-else :name="dmPartner?.name ?? '?'" :status="dmPartner?.status" size="md" />
        </div>
        <div class="min-w-0">
          <div class="flex items-baseline gap-2">
            <h2 class="truncate font-bold capitalize leading-tight text-white">{{ activeRoom?.name }}</h2>
            <span v-if="!hasMultiChannel && activeChannel?.type !== 'text'" class="shrink-0 text-sm text-white/30"> · {{ activeChannel?.name }} </span>
          </div>
          <p class="max-w-xs truncate text-sm leading-tight text-white/30">
            {{ activeRoom?.type === 'dm' ? (dmPartner?.status === 'online' ? 'Active' : `${dmPartner?.title}`) : activeRoom?.description || `${onlineCount} online` }}
          </p>
        </div>
      </div>
      <div v-if="hasMultiChannel" class="flex items-end gap-0">
        <button
          v-for="channel in activeRoom?.channels"
          :key="channel.id"
          class="font-semibold relative flex items-center gap-1.5 p-2 text-sm transition-all duration-150"
          :class="state.activeChannelId === channel.id ? 'text-white' : 'text-white/35 hover:text-white/65'"
          @click="selectChannel(channel.id)">
          <span v-if="state.activeChannelId === channel.id" class="absolute inset-x-0 bottom-0 h-[2px] rounded-t-full bg-primary-400" />
          <span v-if="channel.unread > 0 && state.activeChannelId !== channel.id" class="absolute right-2 top-1.5 size-1.5 rounded-full bg-primary-400" />
          <NuxtIcon :name="CHANNEL_ICONS[channel.type]!" class="text-[18px] md:text-[20px]" />
          <span class="hidden capitalize md:inline">{{ channel.name }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
