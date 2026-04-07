<script setup lang="ts">
const { sendMessage, setTyping, activeChannel } = useChat()

const text = ref('')
const inputRef = useTemplateRef<HTMLTextAreaElement>('inputRef')
const emojiPickerRef = useTemplateRef<HTMLDivElement>('emojiPickerRef')

const EMOJI_QUICK = ['👍', '❤️', '😂', '🔥', '✅', '🎉', '🙏', '👀', '😎', '💪']
const showEmojiPicker = ref(false)

const canSend = computed(() => text.value.trim().length > 0)
const isCallChannel = computed(() => activeChannel.value?.type !== 'text')
const placeholder = computed(() => (activeChannel.value?.type === 'text' ? `Type a message` : 'This is a call channel'))

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
  if (e.key === 'Escape') showEmojiPicker.value = false
}

function submit() {
  if (!canSend.value) return
  sendMessage(text.value.trim())
  text.value = ''
  showEmojiPicker.value = false
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.focus()
    }
  })
}

function insertEmoji(emoji: string) {
  text.value += emoji
  showEmojiPicker.value = false
  inputRef.value?.focus()
}

function autoResize(e: Event) {
  const ta = e.target as HTMLTextAreaElement
  ta.style.height = 'auto'
  ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  setTyping(true)
}

function onBlur() {
  setTyping(false)
}

onClickOutside(emojiPickerRef, () => {
  showEmojiPicker.value = false
})
</script>

<template>
  <div class="shrink-0 px-4 pb-4 pt-2">
    <div v-if="isCallChannel" class="ring-white/8 flex items-center justify-between rounded-2xl bg-dark-500/50 px-5 py-3 ring-1">
      <div class="flex items-center gap-3">
        <div class="bg-white/8 flex size-8 items-center justify-center rounded-xl">
          <NuxtIcon :name="activeChannel?.type === 'voice' ? 'local:microphone' : activeChannel?.type === 'video' ? 'local:camera' : 'local:map'" class="text-base text-white/50" />
        </div>
        <span class="text-sm text-white/45">
          {{ activeChannel?.type === 'location' ? 'Live location channel' : `${activeChannel?.name} channel` }}
        </span>
      </div>
      <button
        class="font-semibold flex items-center gap-2 rounded-xl bg-success-600/90 px-4 py-1.5 text-sm text-white shadow-md shadow-success-600/20 transition-all hover:scale-105 hover:bg-success-600 active:scale-100">
        <NuxtIcon :name="activeChannel?.type === 'voice' ? 'local:microphone' : 'local:camera'" class="text-sm" />
        Join
      </button>
    </div>
    <div v-else class="relative rounded-2xl bg-dark-500/50 ring-1 ring-white/[0.08] transition-shadow duration-200 focus-within:shadow-lg focus-within:shadow-black/20 focus-within:ring-white/[0.14]">
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 translate-y-1 scale-95">
        <div
          v-if="showEmojiPicker"
          ref="emojiPickerRef"
          class="absolute bottom-full left-0 mb-2 flex flex-wrap gap-1 rounded-2xl bg-dark-600/95 p-2.5 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl">
          <button
            v-for="emoji in EMOJI_QUICK"
            :key="emoji"
            class="hover:scale-115 flex size-9 items-center justify-center rounded-xl text-xl transition-all hover:bg-white/10 active:scale-95"
            @click="insertEmoji(emoji)">
            {{ emoji }}
          </button>
        </div>
      </Transition>
      <textarea
        ref="inputRef"
        v-model="text"
        rows="1"
        class="scrollbar-hidden w-full resize-none bg-transparent px-4 pb-2 pt-3 text-base text-white outline-none placeholder:text-white/25"
        :placeholder="placeholder"
        @keydown="handleKeydown"
        @input="autoResize"
        @blur="onBlur" />
      <div class="flex items-center justify-between px-3 py-2">
        <div class="flex items-center gap-0.5">
          <button class="hover:bg-white/8 flex size-8 items-center justify-center rounded-xl text-white/30 transition-all hover:text-white/70 active:scale-95" title="Attach file">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <button class="hover:bg-white/8 flex size-8 items-center justify-center rounded-xl text-white/30 transition-all hover:text-white/70 active:scale-95" title="More options">
            <NuxtIcon name="local:dots" class="text-base" />
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="hover:bg-white/8 flex size-8 items-center justify-center rounded-full transition-all active:scale-95"
            :class="showEmojiPicker ? 'bg-primary-500/15 text-primary-400' : 'text-white/30 hover:text-white/70'"
            title="Emoji"
            @click="showEmojiPicker = !showEmojiPicker">
            <span class="text-base leading-none">😊</span>
          </button>
          <button class="hover:bg-white/8 flex size-8 items-center justify-center rounded-full text-white/30 transition-all hover:text-white/70 active:scale-95" title="Voice message">
            <NuxtIcon name="local:microphone" class="text-base" />
          </button>
          <button
            class="font-semibold ml-1 flex items-center justify-center gap-1.5 rounded-full p-3 transition-all duration-150"
            :class="
              canSend
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 hover:bg-primary-400 hover:shadow-primary-400/30 active:scale-95'
                : 'cursor-not-allowed bg-white/[0.05] text-white/20'
            "
            :disabled="!canSend"
            @click="submit">
            <svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
