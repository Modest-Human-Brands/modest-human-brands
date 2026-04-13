<script setup lang="ts">
interface GroupedMessage extends ChatMessage {
  isFirst: boolean
  isLast: boolean
}

interface MessageGroup {
  dayLabel: string
  messages: GroupedMessage[]
}

const { userId, state, activeMessages, activeChannel, typingUsers } = useChat()

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const isAtBottom = ref(true)
const showScrollBtn = ref(false)
const unreadOffscreen = ref(0)

function scrollToBottom(smooth = false) {
  if (!containerRef.value) return
  containerRef.value.scrollTo({ top: containerRef.value.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  unreadOffscreen.value = 0
}

function onScroll() {
  if (!containerRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 60
  showScrollBtn.value = !isAtBottom.value
  if (isAtBottom.value) unreadOffscreen.value = 0
}

watch(
  () => activeMessages.value.length,
  async (len, prev) => {
    if (prev === 0) {
      await nextTick()
      scrollToBottom()
      return
    }
    const last = activeMessages.value.at(-1)
    if (isAtBottom.value || last?.senderId === userId.value) {
      await nextTick()
      scrollToBottom(true)
    } else if (last?.senderId !== userId.value) {
      unreadOffscreen.value++
    }
  }
)

watch(
  () => state.activeChannelId,
  async () => {
    await nextTick()
    scrollToBottom()
    unreadOffscreen.value = 0
  },
  { immediate: true }
)

const GAP_THRESHOLD = 5 * 60_000

function getDayKey(date: Date): string {
  return date.toLocaleDateString('en-CA') // stable YYYY-MM-DD key for grouping
}

function getDayLabel(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (getDayKey(date) === getDayKey(today)) return 'Today'
  if (getDayKey(date) === getDayKey(yesterday)) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const messageGroups = computed<MessageGroup[]>(() => {
  const msgs = activeMessages.value
  if (!msgs.length) return []

  const grouped: GroupedMessage[] = msgs.map((msg, i) => {
    const prev = msgs[i - 1]
    const next = msgs[i + 1]
    const gapBefore = !prev || prev.senderId !== msg.senderId || msg.at.getTime() - prev.at.getTime() > GAP_THRESHOLD
    const gapAfter = !next || next.senderId !== msg.senderId || next.at.getTime() - msg.at.getTime() > GAP_THRESHOLD
    return { ...msg, isFirst: gapBefore, isLast: gapAfter }
  })

  const days: MessageGroup[] = []
  let currentDayKey = ''

  for (const msg of grouped) {
    const key = getDayKey(msg.at)
    if (key !== currentDayKey) {
      currentDayKey = key
      days.push({ dayLabel: getDayLabel(msg.at), messages: [] })
    }
    days.at(-1)!.messages.push(msg)
  }

  return days
})

const isCallChannel = computed(() => activeChannel.value?.type === 'voice' || activeChannel.value?.type === 'video')
const isLocationChannel = computed(() => activeChannel.value?.type === 'location')

const participants: { name: string }[] = []
</script>

<template>
  <div class="relative min-h-0 w-full flex-1">
    <div v-if="isCallChannel" class="flex h-full flex-col items-center justify-center gap-6 px-8">
      <p class="text-sm font-bold uppercase tracking-widest text-white/25">
        {{ activeChannel?.type === 'voice' ? 'Voice Channel' : 'Video Channel' }}
      </p>
      <div class="grid w-full max-w-sm grid-cols-2 gap-2">
        <div v-for="participant in participants" :key="participant.name" class="ring-white/8 relative flex aspect-video items-end rounded-2xl bg-dark-500/80 ring-1">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="size-10 rounded-full opacity-30" />
          </div>
          <span class="font-semibold relative z-10 truncate px-2 pb-2 text-sm text-white/60">
            {{ participant.name }}
          </span>
        </div>
        <div v-for="i in 4 - participants.length" :key="`empty-${i}`" class="ring-dashed flex aspect-video items-center justify-center rounded-2xl bg-dark-500/40 ring-1 ring-white/10">
          <NuxtIcon name="local:plus" class="text-lg text-white/15" />
        </div>
      </div>
      <div class="text-center">
        <p class="text-sm text-white/40">Nobody's here yet</p>
        <p class="mt-0.5 text-sm text-white/25">Be the first to join the channel</p>
      </div>
      <button
        class="font-semibold flex items-center gap-2 rounded-xl bg-success-600/90 px-7 py-2.5 text-sm text-white shadow-lg shadow-success-600/25 transition-all hover:scale-105 hover:bg-success-600 active:scale-100">
        <NuxtIcon :name="activeChannel?.type === 'voice' ? 'local:microphone' : 'local:camera'" class="text-base" />
        Join Channel
      </button>
    </div>
    <div v-else-if="isLocationChannel" class="flex h-full flex-col items-center justify-center gap-5 px-8">
      <div class="ring-white/8 relative flex w-full max-w-sm items-center justify-center rounded-2xl bg-dark-500/60 ring-1" style="aspect-ratio: 16/9">
        <div class="absolute inset-0 opacity-20" />
        <div class="top-2/5 absolute left-1/3 flex flex-col items-center gap-1">
          <div class="size-3 animate-pulse rounded-full bg-primary-400 shadow-md shadow-primary-400/50 ring-2 ring-primary-400/30" />
          <span class="text-primary-300 rounded-full bg-dark-600/80 px-1.5 py-0.5 text-xs backdrop-blur-sm">Priya</span>
        </div>
        <div class="absolute bottom-1/3 right-1/3 flex flex-col items-center gap-1">
          <div class="size-3 animate-pulse rounded-full bg-success-500 shadow-md shadow-success-500/50 ring-2 ring-success-500/30" />
          <span class="rounded-full bg-dark-600/80 px-1.5 py-0.5 text-xs text-success-400 backdrop-blur-sm">Arjun</span>
        </div>
        <NuxtIcon name="local:map" class="text-4xl text-white/10" />
      </div>
      <div class="text-center">
        <p class="font-semibold text-sm text-white">Live Location Map</p>
        <p class="mt-0.5 text-sm text-white/35">2 members sharing location</p>
      </div>
      <button
        class="font-semibold flex items-center gap-2 rounded-xl bg-primary-600/90 px-7 py-2.5 text-sm text-white shadow-lg shadow-primary-600/20 transition-all hover:scale-105 hover:bg-primary-600 active:scale-100">
        <NuxtIcon name="local:map" class="text-base" />
        Share My Location
      </button>
    </div>
    <div v-else ref="containerRef" class="scrollbar-hidden h-full overflow-y-auto overscroll-contain" @scroll="onScroll">
      <div class="flex flex-col gap-2 py-2">
        <div v-if="!activeMessages.length" class="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <div class="ring-white/8 flex size-14 items-center justify-center rounded-2xl bg-dark-600 ring-1">
            <NuxtIcon name="local:chat" class="text-2xl text-white/25" />
          </div>
          <p class="text-sm text-white/35">No messages yet</p>
          <p class="text-sm text-white/20">Start the conversation below</p>
        </div>
        <template v-for="group in messageGroups" :key="group.dayLabel">
          <div class="flex items-center gap-3 px-5 py-4">
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span class="font-semibold shrink-0 rounded-full bg-dark-500/80 px-3 py-0.5 text-xs text-white/30 ring-1 ring-dark-600">
              {{ group.dayLabel }}
            </span>
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <ChatMessageBubble v-for="msg in group.messages" :key="msg.id" :message="msg" :is-first="msg.isFirst" :is-last="msg.isLast" />
        </template>
        <ChatTypingIndicator :users="typingUsers" />
        <div class="h-3" />
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-3">
      <div v-if="showScrollBtn && !isCallChannel && !isLocationChannel" class="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
        <span v-if="unreadOffscreen > 0" class="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-bold text-white shadow-md shadow-primary-500/40"> {{ unreadOffscreen }} new </span>
        <button
          class="flex size-9 items-center justify-center rounded-full bg-dark-600/95 shadow-xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-sm transition-all hover:scale-110 hover:ring-white/20 active:scale-95"
          @click="scrollToBottom(true)">
          <NuxtIcon name="local:chevron-bold" class="-rotate-90 text-sm text-white/70" />
        </button>
      </div>
    </Transition>
  </div>
</template>
