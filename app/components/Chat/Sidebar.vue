<script setup lang="ts">
const { state, topicRooms, projectRooms, contactRooms, getUserById } = useChat()

const emit = defineEmits<{ selectRoom: [id: string] }>()

function dmPartner(room: ChatRoom): ChatUser | undefined {
  const partnerId = room.memberIds.find((id) => id !== state.currentUserId)
  return partnerId ? getUserById(partnerId) : undefined
}

interface RoomSection {
  label: string
  rooms: ChatRoom[]
  type: RoomType
}

const sections = computed<RoomSection[]>(() => [
  { label: 'Topics', rooms: topicRooms.value, type: 'topic' },
  { label: 'Projects', rooms: projectRooms.value, type: 'project' },
  { label: 'Contacts', rooms: contactRooms.value, type: 'contact' },
])

function isActive(roomId: string) {
  return state.activeRoomId === roomId
}

function activeClass(roomId: string, variant: RoomType) {
  if (!isActive(roomId)) return 'text-white/40 hover:bg-white/[0.04] hover:text-white/75'
  return variant === 'topic' ? 'bg-dark-500 text-white' : 'bg-primary-500/10 text-white'
}
</script>

<template>
  <aside class="flex size-full flex-col border-l border-white/10 md:max-w-60">
    <div v-for="section in sections" :key="section.label" class="flex h-1/3 min-h-0 flex-1 basis-1/3 flex-col">
      <div class="shrink-0 px-3 pb-1 pt-3">
        <span class="text-xs font-bold uppercase tracking-widest text-white/25">
          {{ section.label }}
        </span>
      </div>

      <div class="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <div class="space-y-0.5">
          <template v-if="section.type === 'contact'">
            <button
              v-for="room in section.rooms"
              :key="room.id"
              class="group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150"
              :class="isActive(room.id) ? 'bg-primary-500/10 text-white' : room.unread > 0 ? 'text-white/80 hover:bg-white/[0.04]' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/75'"
              @click="emit('selectRoom', room.id)">
              <span v-if="isActive(room.id)" class="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-primary-400" />

              <div class="relative shrink-0">
                <ChatUserAvatar :name="dmPartner(room)?.name ?? '?'" :status="dmPartner(room)?.status" size="sm" />
                <span
                  v-if="room.unread > 0 && !isActive(room.id)"
                  class="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white ring-2 ring-dark-400">
                  {{ room.unread }}
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-1">
                  <span class="truncate text-base leading-snug" :class="room.unread > 0 && !isActive(room.id) ? 'font-semibold text-white' : ''">{{ room.name }}</span>
                  <NuxtTime :datetime="room.lastAt" :relative="true" class="shrink-0 text-xs text-white/25" />
                </div>
                <p class="truncate text-sm leading-tight" :class="room.unread > 0 && !isActive(room.id) ? 'text-white/55' : 'text-white/25'">
                  {{ room.messages.at(-1)?.content }}
                </p>
              </div>
            </button>
          </template>

          <template v-else>
            <button
              v-for="room in section.rooms"
              :key="room.id"
              class="group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-all duration-150"
              :class="activeClass(room.id, section.type)"
              @click="emit('selectRoom', room.id)">
              <span v-if="isActive(room.id)" class="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full" :class="section.type === 'topic' ? 'bg-primary-500' : 'bg-primary-400'" />

              <div
                class="flex size-9 shrink-0 select-none items-center justify-center rounded-full text-sm font-bold uppercase text-white"
                :class="isActive(room.id) && section.type === 'topic' ? 'bg-dark-400' : 'bg-dark-500'">
                <NuxtImg v-if="room.logo" :src="room.logo" :alt="room.name" class="size-6 object-contain" />
                <span v-else>{{ room.name.at(0) }}</span>
              </div>

              <span class="min-w-0 flex-1 truncate text-base capitalize">{{ room.name }}</span>

              <span v-if="room.unread > 0 && !isActive(room.id)" class="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-bold text-white">
                {{ room.unread > 9 ? '9+' : room.unread }}
              </span>
            </button>
          </template>
        </div>
      </div>

      <div v-if="section.type !== 'contact'" class="mx-3 h-px shrink-0 bg-white/[0.06]" />
    </div>
  </aside>
</template>
