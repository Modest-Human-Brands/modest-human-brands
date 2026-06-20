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
    class="group flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition-all md:p-3"
    :class="[isActive ? 'border-dark-600 bg-dark-500' : 'border-transparent bg-dark-400 hover:bg-dark-500']">
    <div class="relative shrink-0">
      <div class="font-semibold flex size-12 items-center justify-center rounded-full bg-white text-lg text-dark-500">
        {{ contact.initial }}
      </div>
      <div class="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-dark-500 p-1">
        <NuxtIcon :name="getChannelIcon(contact.activeChannel)" class="text-[14px] text-white md:text-[16px]" />
      </div>
    </div>

    <div class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1">
      <span class="font-semibold truncate text-sm text-white md:text-base">{{ contact.name }}</span>
      <span class="justify-self-end text-xs font-light text-light-400 md:text-base">{{ timeAgo }}</span>

      <span class="truncate text-xs text-light-500 md:text-base">{{ contact.lastMessageSnippet }}</span>
      <span class="font-semibold justify-self-end text-2xs uppercase tracking-wider text-light-600 md:text-sm">{{ contact.company }}</span>

      <div class="flex items-center gap-1.5">
        <NuxtIcon v-for="channel in contact.availableChannels" :key="channel" :name="getChannelIcon(channel)" class="text-[14px] text-white md:text-[16px]" />
      </div>
      <div class="flex justify-end">
        <span v-if="contact.unreadCount" class="size-5 rounded-full bg-primary-500 p-1 text-center align-middle text-2xs text-white md:size-6 md:text-xs">
          {{ contact.unreadCount }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
