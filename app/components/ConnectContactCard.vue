<script setup lang="ts">
const props = defineProps<{
  contact: ChatContact
  isActive?: boolean
}>()

const timeAgo = useTimeAgo(new Date(props.contact.lastActive))

function getChannelIcon(channel: ChannelType) {
  const map: Record<ChannelType, string> = {
    email: 'local:email',
    whatsapp: 'local:whatsapp',
    instagram: 'local:instagram',
    sms: 'local:chat',
    phone: 'local:phone',
  }
  return map[channel] || 'local:dots'
}
</script>

<template>
  <NuxtLink
    :to="`/connect/channel/${contact.id}`"
    class="flex cursor-pointer items-center gap-3 rounded-xl border p-1 transition-all md:p-4"
    :class="[isActive ? 'border-dark-600 bg-dark-500' : 'border-transparent bg-dark-400 hover:bg-dark-500']">
    <div class="relative shrink-0">
      <div class="flex size-12 items-center justify-center rounded-full bg-white text-lg font-bold text-dark-500">
        {{ contact.initial }}
      </div>
      <div class="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-dark-500 p-1">
        <NuxtIcon :name="getChannelIcon(contact.activeChannel)" class="text-sm text-white" />
      </div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <div class="flex items-center justify-between">
        <span class="truncate text-sm font-bold text-white">{{ contact.name }}</span>
        <span class="shrink-0 text-sm font-light text-light-400">{{ timeAgo }}</span>
      </div>
      <div class="flex items-end justify-between">
        <span class="truncate text-sm text-light-500">{{ contact.lastMessageSnippet }}</span>
        <span class="ml-2 shrink-0 text-sm font-bold uppercase tracking-wider text-light-600">
          {{ contact.company }}
        </span>
      </div>
      <div class="mt-1 flex items-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
        <NuxtIcon v-for="ch in contact.availableChannels" :key="ch" :name="getChannelIcon(ch)" class="text-[14px] text-white" />
      </div>
    </div>
  </NuxtLink>
</template>
