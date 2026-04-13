<script setup lang="ts">
defineProps<{ users: ChatUser[] }>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2">
    <div v-if="users.length" class="flex items-end gap-2.5 px-4 pb-0.5 pt-1">
      <div class="w-7 shrink-0">
        <ChatUserAvatar :name="users[0]!.name" size="sm" />
      </div>
      <div class="flex flex-col items-start gap-1">
        <span class="font-semibold text-sm">
          {{ users.map((u) => u.name.split(' ')[0]).join(', ') }}
        </span>
        <div class="flex items-center gap-1 rounded-2xl rounded-tl-md bg-dark-600 px-4 py-3 ring-1 ring-dark-600">
          <span class="size-1.5 animate-bounce rounded-full bg-white/40" style="animation-delay: 0ms" />
          <span class="size-1.5 animate-bounce rounded-full bg-white/40" style="animation-delay: 160ms" />
          <span class="size-1.5 animate-bounce rounded-full bg-white/40" style="animation-delay: 320ms" />
        </div>
      </div>
    </div>
  </Transition>
</template>
