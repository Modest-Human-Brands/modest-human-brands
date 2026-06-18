import { RoomEvent, EventTimeline } from 'matrix-js-sdk'
import type { MatrixEvent, Room, MatrixClient } from 'matrix-js-sdk'

export const useCoordinate = (roomId?: string | Ref<string | null>) => {
  const { initClient, isReady } = useMatrix()

  const conversations = ref<CoordinateConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const inboxPending = ref(true)
  const chatPending = ref(true)
  const isPaginating = ref(false)

  let localClient: MatrixClient | null = null
  let isUnmounted = false

  const buildConversation = (room: Room): CoordinateConversation => {
    const events = room.getLiveTimeline().getEvents()
    let lastEvent = null

    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].getType() === 'm.room.message') {
        lastEvent = events[i]
        break
      }
    }

    const memberCount = room.getJoinedMembers().length
    const isDirect = memberCount <= 2
    const baseUrl = localClient?.baseUrl || ''

    return {
      id: room.roomId,
      type: isDirect ? 'people' : 'projects',
      name: room.name || 'Unnamed Room',
      snippet: lastEvent?.getContent()?.body || 'No messages yet',
      projectContext: isDirect ? 'Direct Message' : 'Team Room',
      lastActive: lastEvent ? new Date(lastEvent.getTs() ?? Date.now()).toISOString() : new Date().toISOString(),
      avatarUrl: baseUrl ? room.getAvatarUrl(baseUrl, 96, 96, 'crop') : null,
    }
  }

  const buildMessage = (event: MatrixEvent): ChatMessage => {
    const senderId = event.getSender() || 'unknown'
    return {
      id: event.getId() || `local-${Date.now()}`,
      isOwn: senderId === localClient!.getUserId(),
      senderInitial: senderId.charAt(1).toUpperCase(),
      senderName: senderId,
      time: new Date(event.getTs() ?? Date.now()).toISOString(),
      status: 'sent',
      content: event.getContent()?.body || '',
    }
  }

  const loadMessages = (id: string) => {
    if (!localClient) return
    const room = localClient.getRoom(id)
    if (room) {
      messages.value = room
        .getLiveTimeline()
        .getEvents()
        .filter((event) => event.getType() === 'm.room.message')
        .map(buildMessage)
    } else {
      messages.value = []
    }
  }

  const updateRooms = () => {
    if (!localClient) return
    conversations.value = localClient
      .getRooms()
      .map(buildConversation)
      .toSorted((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
  }

  const handleTimeline = (event: MatrixEvent, room: Room | undefined, toStartOfTimeline: boolean | undefined) => {
    if (toStartOfTimeline || !room || event.getType() !== 'm.room.message') return

    const index = conversations.value.findIndex((c) => c.id === room.roomId)
    const updatedConvo = buildConversation(room)

    if (index !== -1) {
      conversations.value[index] = updatedConvo
    } else {
      conversations.value.push(updatedConvo)
    }
    conversations.value = conversations.value.toSorted((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())

    const currentRoomId = unref(roomId)
    if (currentRoomId && room.roomId === currentRoomId) {
      const eventId = event.getId()
      if (eventId && !messages.value.some((m) => m.id === eventId)) {
        messages.value.push(buildMessage(event))
      }
    }
  }

  const sendMessage = async (text: string) => {
    const currentRoomId = unref(roomId)
    if (!text.trim() || !localClient || !currentRoomId) return

    try {
      await localClient.sendEvent(currentRoomId, 'm.room.message', {
        msgtype: 'm.text',
        body: text,
      })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const loadMoreMessages = async () => {
    const currentRoomId = unref(roomId)
    if (!currentRoomId || !localClient || isPaginating.value) return

    const room = localClient.getRoom(currentRoomId)
    if (!room) return

    const token = room.getLiveTimeline().getPaginationToken(EventTimeline.BACKWARDS)
    if (!token) return

    isPaginating.value = true
    try {
      await localClient.scrollback(room, 30)
      loadMessages(currentRoomId)
    } catch (err) {
      console.error('Matrix scrollback failed:', err)
    } finally {
      isPaginating.value = false
    }
  }

  onMounted(async () => {
    localClient = await initClient()

    if (!localClient || isUnmounted) {
      inboxPending.value = false
      chatPending.value = false
      return
    }

    const loadInitialData = () => {
      if (isUnmounted) return
      updateRooms()
      inboxPending.value = false

      const currentRoomId = unref(roomId)
      if (currentRoomId) {
        loadMessages(currentRoomId)
      }
      chatPending.value = false
    }

    if (isReady.value) {
      loadInitialData()
    } else {
      const unwatch = watch(isReady, (ready) => {
        if (ready) {
          loadInitialData()
          unwatch()
        }
      })
    }

    localClient.on(RoomEvent.Timeline, handleTimeline)
  })

  onUnmounted(() => {
    isUnmounted = true
    if (localClient) {
      localClient.removeListener(RoomEvent.Timeline, handleTimeline)
    }
  })

  watch(
    () => unref(roomId),
    (newId) => {
      if (newId && localClient) {
        loadMessages(newId)
      }
    }
  )

  return {
    conversations,
    messages,
    inboxPending,
    chatPending,
    isPaginating,
    sendMessage,
    loadMoreMessages,
  }
}
