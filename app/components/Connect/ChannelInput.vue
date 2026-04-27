<script setup lang="ts">
const mode = ref<'message' | 'note'>('message')
</script>

<template>
  <div class="rounded-xl border border-white/10 p-2">
    <div class="flex gap-4 border-b border-white/5 px-4 pb-2 text-xs font-semi-bold">
      <button :class="mode === 'message' ? 'text-white' : 'text-white'" @click="mode = 'message'">Message</button>
      <button :class="mode === 'note' ? 'text-white' : 'text-white'" @click="mode = 'note'">Note</button>
    </div>

    <textarea placeholder="Type a message..." class="min-h-[80px] w-full resize-none bg-transparent p-4 text-sm text-white outline-none"></textarea>

    <div class="flex items-center justify-between px-2 pb-2">
      <div class="flex gap-3 text-white">
        <button class="hover:text-white">
          <NuxtIcon name="local:attachment" />
        </button>
        <button class="hover:text-white">
          <NuxtIcon name="local:emoji" />
        </button>
        <button class="hover:text-white">
          <NuxtIcon name="local:task" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button class="text-white">
          <NuxtIcon name="local:mic" />
        </button>
        <button class="flex size-9 items-center justify-center rounded-full bg-success-600 text-dark-400">
          <NuxtIcon name="local:send" />
        </button>
      </div>
    </div>
  </div>
</template>
