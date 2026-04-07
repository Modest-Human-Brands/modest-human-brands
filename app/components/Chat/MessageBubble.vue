<script setup lang="ts">
const props = defineProps<{
  message: ChatMessage
  isFirst: boolean
  isLast: boolean
}>()

const { userId, getUserById, toggleReaction, activeMembers } = useChat()

const sender = computed(() => getUserById(props.message.senderId))
const isOwn = computed(() => props.message.senderId === userId.value)
const showAvatar = computed(() => !isOwn.value && props.isFirst)

const readByOthers = computed(() =>
  props.message.readBy
    .filter((id) => id !== userId.value)
    .map((id) => activeMembers.value.find((u) => u.id === id))
    .filter(Boolean)
)

const readState = computed<'sent' | 'delivered' | 'read'>(() => {
  if (readByOthers.value.length > 0) return 'read'
  if (props.message.readBy.includes(userId.value!)) return 'delivered'
  return 'sent'
})

// const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '✅']
const showActions = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

function onEnter() {
  if (hideTimer) clearTimeout(hideTimer)
  showActions.value = true
}
function onLeave() {
  hideTimer = setTimeout(() => {
    showActions.value = false
  }, 200)
}

function onToggleReaction(emoji: string) {
  toggleReaction(props.message.id, emoji)
}

function docIconColor(fileName?: string): string {
  if (!fileName) return '#B4B4B4'
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '#FF6B6B'
  if (['xls', 'xlsx', 'csv'].includes(ext ?? '')) return '#48FEA7'
  if (['doc', 'docx'].includes(ext ?? '')) return '#6B9FFF'
  return '#B4B4B4'
}
</script>

<template>
  <div class="group relative flex gap-2.5 px-4" :class="[isOwn ? 'flex-row-reverse' : 'flex-row', isFirst ? 'pt-3' : 'pt-0.5', isLast ? 'pb-1' : 'pb-0']" @mouseenter="onEnter" @mouseleave="onLeave">
    <ChatUserAvatar v-if="showAvatar" :name="sender?.name ?? '?'" size="sm" />
    <div class="flex min-w-0 flex-col" :class="isOwn ? 'items-end' : 'items-start'">
      <div v-if="isFirst && !isOwn" class="mb-1 flex items-baseline gap-2 pl-0.5">
        <span class="font-semibold text-sm">
          {{ sender?.name }}
        </span>
        <NuxtTime :datetime="message.at" hour="2-digit" minute="2-digit" hour-cycle="h11" class="text-xs text-white/25" />
      </div>
      <div v-if="message.type === 'system'" class="flex w-full items-center gap-3">
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span class="ring-white/8 rounded-full bg-white/5 px-3 py-0.5 text-xs italic text-white/35 ring-1">
          {{ message.content }}
        </span>
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div
        v-else-if="message.type === 'text'"
        class="relative max-w-full whitespace-break-spaces rounded-xl px-3.5 pb-2 pt-2 text-sm leading-relaxed"
        :class="isOwn ? 'rounded-tr-none bg-primary-600/40 text-white ring-1 ring-primary-500/25' : 'rounded-tl-none bg-white/[0.07] text-white/90 ring-1 ring-white/[0.06]'">
        <span>{{ message.content }}</span>
        <span v-if="message.edited" class="ml-1 text-xs opacity-40">(edited)</span>
        <NuxtTime v-if="isOwn" :datetime="message.at" hour="2-digit" minute="2-digit" hour-cycle="h11" class="ml-2 inline-block align-bottom text-xs leading-loose text-white/30" />
      </div>
      <div v-else-if="message.type === 'image'" class="overflow-hidden rounded-xl" :class="isOwn ? 'rounded-tr-md' : 'rounded-tl-md'">
        <p v-if="message.content" class="mb-1.5 px-0.5 text-sm text-white/50">{{ message.content }}</p>
        <div class="relative">
          <img :src="message.imageUrl" :alt="message.content" class="block max-w-xs cursor-pointer object-contain transition-opacity hover:opacity-90 md:max-w-sm" loading="lazy" />
          <NuxtTime
            v-if="isOwn"
            :datetime="message.at"
            hour="2-digit"
            minute="2-digit"
            hour-cycle="h11"
            class="absolute bottom-2 right-2 rounded-full bg-black/50 px-1.5 py-0.5 text-xs text-white/80 backdrop-blur-sm" />
        </div>
      </div>
      <div
        v-else-if="message.type === 'document'"
        class="flex w-60 items-center gap-3 rounded-xl p-3 ring-1 transition-all hover:bg-white/[0.03]"
        :class="isOwn ? 'rounded-tr-none bg-primary-600/30 ring-primary-500/20' : 'rounded-tl-none bg-white/[0.06] ring-white/[0.07]'">
        <div class="bg-white/8 flex size-9 shrink-0 items-center justify-center rounded-xl">
          <NuxtIcon name="local:document" class="text-lg" :style="{ color: docIconColor(message.fileName) }" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold truncate text-sm text-white">{{ message.fileName }}</p>
          <p class="text-sm text-white/35">{{ message.fileSize }}</p>
        </div>
        <button class="shrink-0 rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white">
          <NuxtIcon name="local:download" class="text-sm" />
        </button>
      </div>
      <div v-if="message.reactions.length" class="mt-1.5 flex flex-wrap gap-1" :class="isOwn ? 'justify-end' : 'justify-start'">
        <button
          v-for="reaction in message.reactions"
          :key="reaction.emoji"
          class="flex items-center gap-1 rounded-full px-2 py-0.5 text-sm ring-1 transition-all duration-150 active:scale-95"
          :class="reaction.reactedByMe ? 'text-primary-300 bg-primary-500/20 ring-primary-500/40' : 'bg-white/[0.05] text-white/60 ring-white/10 hover:bg-white/10 hover:ring-white/20'"
          @click="onToggleReaction(reaction.emoji)">
          <span class="text-sm leading-none">{{ reaction.emoji }}</span>
          <span class="font-semibold text-sm">{{ reaction.count }}</span>
        </button>
      </div>
      <div v-if="isOwn && isLast" class="mt-1 flex items-center gap-1.5">
        <template v-if="readState === 'read'">
          <div class="flex -space-x-1.5">
            <ChatUserAvatar v-for="user in readByOthers.slice(0, 3)" :key="user!.id" :name="user!.name" size="xs" />
          </div>
        </template>
        <template v-else-if="readState === 'delivered'">
          <svg class="size-3.5 text-white/30" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 8l4 4 4-4M5 12l4-4 4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
          </svg>
        </template>
        <template v-else>
          <NuxtIcon name="local:check" class="text-sm text-white/20" />
        </template>
      </div>
    </div>
    <!-- Quick reactions -->
    <!--<Transition enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-0.5" enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-100 ease-in" leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95">
       <div v-if="showActions && message.type !== 'system'"
        class="absolute -top-4 z-20 flex items-center gap-0.5 rounded-xl bg-dark-600/95 p-1 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-md"
        :class="isOwn ? 'right-8' : 'left-8'" @mouseenter="onEnter" @mouseleave="onLeave">
        <button v-for="emoji in QUICK_REACTIONS" :key="emoji"
          class="flex size-7 items-center justify-center rounded-xl text-base transition-all hover:scale-110 hover:bg-white/10 active:scale-95"
          @click="onToggleReaction(emoji)">
          {{ emoji }}
        </button>
        <div class="mx-1 h-4 w-px bg-white/10" />
        <button
          class="flex size-7 items-center justify-center rounded-xl text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          title="Reply">
          <svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
          </svg>
        </button>
        <button
          class="flex size-7 items-center justify-center rounded-xl text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          title="More">
          <NuxtIcon name="local:dots" class="text-sm" />
        </button>
      </div> 
    </Transition>-->
  </div>
</template>
