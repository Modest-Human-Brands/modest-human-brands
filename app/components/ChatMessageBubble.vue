<script setup lang="ts">
const props = defineProps<{ message: ChatMessage }>()
const timeAgo = useTimeAgo(new Date(props.message.time))
</script>

<template>
  <div class="flex w-full flex-col">
    <div v-if="message.dateGroup" class="my-6 flex w-full justify-center">
      <span class="rounded-full bg-dark-500 px-4 py-1.5 text-sm font-bold text-light-500">
        {{ message.dateGroup }}
      </span>
    </div>

    <div class="my-2 flex w-full items-end gap-3" :class="[message.isOwn ? 'justify-end' : 'justify-start']">
      <div v-if="!message.isOwn" class="flex flex-col items-center gap-1">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-dark-500">
          {{ message.senderInitial }}
        </div>
      </div>

      <div class="flex w-full flex-col gap-1 md:max-w-[80%]">
        <div class="flex items-center gap-2 px-1" :class="[message.isOwn ? 'justify-end' : 'justify-start']">
          <span class="text-sm font-bold text-light-400">{{ message.isOwn ? 'You' : message.senderName }}</span>
          <div class="flex items-center gap-1.5">
            <span class="text-sm text-light-500">{{ timeAgo }}</span>
            <template v-if="message.isOwn">
              <NuxtIcon v-if="message.status === 'sending'" name="local:sync" class="animate-spin text-[14px] text-light-500" />
              <NuxtIcon v-else-if="message.status === 'error'" name="local:warning" class="text-[14px] text-alert-500" title="Failed to send" />
              <NuxtIcon v-else name="local:check" class="text-[14px] text-success-500" />
            </template>
          </div>
        </div>

        <p class="break-words rounded-2xl px-5 py-3 text-sm text-white" :class="[message.isOwn ? 'rounded-br-sm bg-dark-600' : 'rounded-bl-sm bg-dark-500']">
          {{ message.text }}
        </p>
      </div>
    </div>
  </div>
</template>
