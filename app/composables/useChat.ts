import { useStorage } from '@vueuse/core'
import { ClientEvent, MatrixEventEvent, MsgType, RoomEvent, RoomMemberEvent, createClient } from 'matrix-js-sdk'
import type { MatrixClient, MatrixEvent, Room, RoomMember } from 'matrix-js-sdk'
import { VerificationPhase, VerificationRequestEvent, decodeRecoveryKey, type VerificationRequest } from 'matrix-js-sdk/lib/crypto-api'

export type RoomType = 'topic' | 'project' | 'contact'
export type ChannelType = 'text' | 'voice' | 'video' | 'location'
export type MessageContentType = 'text' | 'image' | 'document' | 'system'
export type UserStatus = 'online' | 'offline' | 'away' | 'dnd'

export interface ChatUser {
  id: string
  name: string
  status: UserStatus
  role: 'admin' | 'moderator' | 'member'
  title: string
}

export interface Channel {
  id: string
  name: string
  type: ChannelType
  unread: number
}

export interface Reaction {
  emoji: string
  count: number
  reactedByMe: boolean
}

export interface ChatMessage {
  id: string
  roomId: string
  channelId: string
  senderId: string
  content: string
  type: MessageContentType
  at: Date
  readBy: string[]
  reactions: Reaction[]
  replyToId?: string
  fileName?: string
  fileSize?: string
  imageUrl?: string
  edited?: boolean
}

export interface ChatRoom {
  id: string
  name: string
  type: RoomType
  description: string
  logo?: string
  channels: Channel[]
  memberIds: string[]
  unread: number
  muted: boolean
  lastAt: Date
  messages: ChatMessage[]
}

interface CryptoState {
  isVerified: boolean
  pendingVerificationRequest: VerificationRequest | null
  keyBackupEnabled: boolean
}

interface LiveState {
  rooms: ChatRoom[]
  users: ChatUser[]
}

interface SessionState {
  typingUserIds: string[]
  isReady: boolean
  isLoading: boolean
  error: string | null
}

const ACTIVE_SPACE_NAME = 'RED CAT PICTURES'

const navState = useStorage('matrix-chat-nav', {
  userId: '',
  activeRoomId: '',
  activeChannelId: '',
})

const userId = useStorage<string | null>('matrix-user-id', null)

const deviceId = useStorage<string | null>('matrix-device-id', null)

const liveState = reactive<LiveState>({
  rooms: [],
  users: [],
})

const sessionState = reactive<SessionState>({
  typingUserIds: [],
  isReady: false,
  isLoading: false,
  error: null,
})

const cryptoState = reactive<CryptoState>({
  isVerified: false,
  pendingVerificationRequest: null,
  keyBackupEnabled: false,
})

const client = shallowRef<MatrixClient | null>(null)

let listenersAttached = false
let typingTimeout: ReturnType<typeof setTimeout> | null = null

function findWorkspaceSpace(rooms: Room[]): Room | null {
  return rooms.find((room) => room.isSpaceRoom() && room.name.toUpperCase() === ACTIVE_SPACE_NAME.toUpperCase()) ?? null
}

function resolveWorkspaceRooms(allRooms: Room[], currentUserId: string): Room[] {
  const space = findWorkspaceSpace(allRooms)

  if (!space) {
    return allRooms.filter((room) => !room.isSpaceRoom())
  }

  const childRoomIds = getSpaceChildRoomIds(space)
  const childRooms = allRooms.filter((room) => childRoomIds.has(room.roomId))
  const spaceMemberIds = getSpaceMemberIds(childRooms)

  const result: Room[] = []

  for (const room of allRooms) {
    if (room.isSpaceRoom()) continue

    if (childRoomIds.has(room.roomId)) {
      result.push(room)
      continue
    }

    const partnerId = getDMPartnerId(room, currentUserId)
    if (partnerId && spaceMemberIds.has(partnerId)) {
      result.push(room)
    }
  }

  return result
}

function getSpaceChildRoomIds(space: Room): Set<string> {
  const ids = new Set<string>()

  for (const event of space.currentState.getStateEvents('m.space.child')) {
    const stateKey = event.getStateKey()
    const content = event.getContent() as { via?: string[] }
    if (stateKey && content.via && content.via.length > 0) {
      ids.add(stateKey)
    }
  }

  return ids
}

function getSpaceMemberIds(childRooms: Room[]): Set<string> {
  const ids = new Set<string>()
  for (const room of childRooms) {
    for (const member of room.getJoinedMembers()) {
      ids.add(member.userId)
    }
  }
  return ids
}

function getDMPartnerId(room: Room, currentUserId: string): string | null {
  if (room.isSpaceRoom()) return null
  const members = room.getJoinedMembers()
  if (members.length !== 2) return null
  return members.find((member) => member.userId !== currentUserId)?.userId ?? null
}

function mapMember(member: RoomMember): ChatUser {
  return {
    id: member.userId,
    name: member.name,
    status: (member.user?.presence as UserStatus | undefined) ?? 'offline',
    role: member.powerLevel >= 100 ? 'admin' : member.powerLevel >= 50 ? 'moderator' : 'member',
    title: '',
  }
}

function resolveRoomType(room: Room, currentUserId: string): RoomType {
  if (getDMPartnerId(room, currentUserId)) return 'contact'

  const name = room.name.toLowerCase()
  if (name.startsWith('project') || name.startsWith('p-') || /^p\d{3}/.test(name)) return 'project'

  return 'topic'
}

function buildChannels(roomId: string, type: RoomType, unread: number): Channel[] {
  const channels: Channel[] = [
    { id: roomId, name: 'text', type: 'text', unread },
    { id: `voice::${roomId}`, name: 'voice', type: 'voice', unread: 0 },
  ]

  if (type !== 'contact') {
    channels.push({ id: `video::${roomId}`, name: 'video', type: 'video', unread: 0 })
  }

  if (type === 'project') {
    channels.push({ id: `location::${roomId}`, name: 'location', type: 'location', unread: 0 })
  }

  return channels
}

function mapEvent(event: MatrixEvent, roomId: string): ChatMessage | null {
  const type = event.getType()
  if ((type !== 'm.room.message' && type !== 'm.room.encrypted') || event.isRedacted()) return null

  const content = event.getContent() as {
    msgtype?: string
    body?: string
    url?: string
    filename?: string
    info?: { size?: number }
  }

  const msgtype = content.msgtype ?? 'm.text'
  const contentType: MessageContentType = msgtype === 'm.image' ? 'image' : ['m.file', 'm.audio', 'm.video'].includes(msgtype) ? 'document' : 'text'

  return {
    id: event.getId() ?? `fallback-${event.getTs()}`,
    roomId,
    channelId: roomId,
    senderId: event.getSender() ?? '',
    content: content.body ?? (type === 'm.room.encrypted' ? 'Waiting for key...' : ''),
    type: contentType,
    at: new Date(event.getTs()),
    readBy: [],
    reactions: [],
    edited: !!event.replacingEvent(),
    imageUrl: contentType === 'image' ? content.url : undefined,
    fileName: contentType === 'document' ? (content.filename ?? content.body) : undefined,
    fileSize: content.info?.size ? `${(content.info.size / 1024 / 1024).toFixed(1)} MB` : undefined,
  }
}

function sortMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => a.at.getTime() - b.at.getTime())
}

function mapRoom(room: Room, currentUserId: string): ChatRoom {
  const type = resolveRoomType(room, currentUserId)
  const timeline = room.getLiveTimeline().getEvents()
  const lastMsg = [...timeline].reverse().find((event) => event.getType() === 'm.room.message' || event.getType() === 'm.room.encrypted')
  const unread = room.getUnreadNotificationCount() ?? 0
  const topic = (room.currentState.getStateEvents('m.room.topic', '')?.getContent() as { topic?: string })?.topic ?? ''

  return {
    id: room.roomId,
    name: type === 'contact' ? room.getDefaultRoomName(currentUserId) : room.name,
    type,
    description: topic,
    channels: buildChannels(room.roomId, type, unread),
    memberIds: room.getJoinedMembers().map((member) => member.userId),
    unread,
    muted: false,
    lastAt: new Date(lastMsg?.getTs() ?? room.getLastActiveTimestamp()),
    messages: sortMessages(eventsToMessages(timeline, room.roomId)),
  }
}

function deduplicateUsers(rooms: Room[]): ChatUser[] {
  return rooms
    .flatMap((room) => room.getJoinedMembers())
    .reduce<ChatUser[]>((acc, member) => {
      if (!acc.some((user) => user.id === member.userId)) {
        acc.push(mapMember(member))
      }
      return acc
    }, [])
}

function eventsToMessages(events: MatrixEvent[], roomId: string): ChatMessage[] {
  return events.map((event) => mapEvent(event, roomId)).filter((message): message is ChatMessage => message !== null)
}

async function createIndexedDBStore(user: string) {
  const { IndexedDBStore, MemoryStore } = await import('matrix-js-sdk')

  try {
    if (!import.meta.client || !window.indexedDB) {
      throw new Error('IndexedDB not available')
    }

    return new IndexedDBStore({
      indexedDB: window.indexedDB,
      localStorage: window.localStorage,
      dbName: `mhb-matrix-store-${user}`,
    })
  } catch (err) {
    console.warn('Falling back to MemoryStore', err)
    return new MemoryStore()
  }
}

async function createIndexedDBCryptoStore(user: string) {
  const { IndexedDBCryptoStore } = await import('matrix-js-sdk')

  if (!import.meta.client || !window.indexedDB) {
    throw new Error('IndexedDB not available')
  }

  return new IndexedDBCryptoStore(window.indexedDB, `mhb-matrix-crypto-${user}`)
}

async function bootstrapCrypto(matrixClient: MatrixClient, recoveryKey: string): Promise<void> {
  const crypto = matrixClient.getCrypto()
  if (!crypto) return

  const decodedKey = decodeRecoveryKey(recoveryKey)
  const isSSSSReady = await crypto.isSecretStorageReady()

  await crypto.bootstrapSecretStorage(
    isSSSSReady
      ? {
          setupNewKeyBackup: false,
        }
      : {
          createSecretStorageKey: async () => ({
            keyInfo: { name: 'MHB Key' },
            privateKey: decodedKey,
          }),
          setupNewKeyBackup: true,
        }
  )

  // Fix later
  crypto
    .bootstrapCrossSigning({
      authUploadDeviceSigningKeys: async (makeRequest) => makeRequest({}),
    })
    .catch(() => null)

  try {
    await crypto.loadSessionBackupPrivateKeyFromSecretStorage()
    const backupInfo = await crypto.checkKeyBackupAndEnable()
    cryptoState.keyBackupEnabled = !!backupInfo
  } catch {
    cryptoState.keyBackupEnabled = false
  }

  try {
    const verificationStatus = await crypto.getDeviceVerificationStatus(matrixClient.getUserId()!, matrixClient.getDeviceId()!)
    cryptoState.isVerified = verificationStatus?.isVerified() ?? false
  } catch {
    cryptoState.isVerified = false
  }
}

function attachVerificationListeners(matrixClient: MatrixClient): void {
  matrixClient.on('crypto.verificationRequest' as never, (request: VerificationRequest) => {
    if (request.phase !== VerificationPhase.Requested) return

    cryptoState.pendingVerificationRequest = request

    request.on(VerificationRequestEvent.Change, () => {
      if (request.phase === VerificationPhase.Done || request.phase === VerificationPhase.Cancelled) {
        cryptoState.pendingVerificationRequest = null

        matrixClient
          .getCrypto()
          ?.getDeviceVerificationStatus(matrixClient.getUserId()!, matrixClient.getDeviceId()!)
          .then((status) => {
            cryptoState.isVerified = status?.isVerified() ?? false
          })
          .catch(() => {
            cryptoState.isVerified = false
          })
      }
    })
  })
}

function attachListeners(matrixClient: MatrixClient): void {
  if (listenersAttached) return
  listenersAttached = true

  matrixClient.on(RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
    if (!room || event.status != null) return

    const allRooms = matrixClient.getRooms()
    const workspaceRooms = resolveWorkspaceRooms(allRooms, navState.value.userId)
    const isWorkspaceRoom = workspaceRooms.some((r) => r.roomId === room.roomId)
    if (!isWorkspaceRoom) return

    const roomRef = liveState.rooms.find((item) => item.id === room.roomId)
    if (!roomRef) return

    const msg = mapEvent(event, room.roomId)
    if (msg) {
      const txnId = event.getUnsigned()?.transaction_id
      const optimisticIdx = txnId ? roomRef.messages.findIndex((message) => message.id === txnId) : -1

      if (optimisticIdx !== -1) {
        roomRef.messages.splice(optimisticIdx, 1, msg)
      } else if (!roomRef.messages.some((message) => message.id === msg.id)) {
        roomRef.messages.push(msg)
      }
    }

    const content = event.getContent() as { body?: string }
    const type = event.getType()
    if (type !== 'm.room.message' && type !== 'm.room.encrypted') return

    roomRef.lastAt = new Date(event.getTs())

    if (!toStartOfTimeline && room.roomId !== navState.value.activeRoomId) {
      roomRef.unread += 1
      const textChannel = roomRef.channels.find((channel) => channel.type === 'text')
      if (textChannel) textChannel.unread += 1
    }

    roomRef.lastAt = new Date(event.getTs())
    if (content.body) {
      roomRef.lastAt = new Date(event.getTs())
    }
  })

  matrixClient.on(MatrixEventEvent.Decrypted, (event) => {
    const roomId = event.getRoomId()
    if (!roomId) return

    const allRooms = matrixClient.getRooms()
    const workspaceRooms = resolveWorkspaceRooms(allRooms, navState.value.userId)
    const isWorkspaceRoom = workspaceRooms.some((r) => r.roomId === roomId)
    if (!isWorkspaceRoom) return

    const roomRef = liveState.rooms.find((item) => item.id === roomId)
    if (!roomRef) return

    const updatedMessage = mapEvent(event, roomId)
    if (!updatedMessage) return

    const index = roomRef.messages.findIndex((message) => message.id === updatedMessage.id)
    if (index !== -1) {
      roomRef.messages[index] = updatedMessage
    }
  })

  matrixClient.on(RoomMemberEvent.Typing, (_event, member) => {
    if (!member || member.userId === navState.value.userId) return

    if (member.typing) {
      if (!sessionState.typingUserIds.includes(member.userId)) {
        sessionState.typingUserIds.push(member.userId)
      }
    } else {
      sessionState.typingUserIds = sessionState.typingUserIds.filter((id) => id !== member.userId)
    }
  })

  matrixClient.on(ClientEvent.Room, (room: Room) => {
    const allRooms = matrixClient.getRooms()
    const workspaceRooms = resolveWorkspaceRooms(allRooms, navState.value.userId)
    const isWorkspaceRoom = workspaceRooms.some((r) => r.roomId === room.roomId)

    if (isWorkspaceRoom && !liveState.rooms.some((item) => item.id === room.roomId)) {
      liveState.rooms.push(mapRoom(room, navState.value.userId))

      for (const member of room.getJoinedMembers()) {
        if (!liveState.users.some((user) => user.id === member.userId)) {
          liveState.users.push(mapMember(member))
        }
      }
    }
  })

  matrixClient.on(ClientEvent.Sync, (state: string) => {
    if (state === 'PREPARED') sessionState.isReady = true
  })
}

function waitForSync(matrixClient: MatrixClient): Promise<void> {
  return new Promise((resolve, reject) => {
    if (sessionState.isReady) {
      resolve()
      return
    }

    const onSync = (state: string): void => {
      if (state === 'PREPARED') {
        matrixClient.off(ClientEvent.Sync, onSync as never)
        resolve()
        return
      }

      if (state === 'ERROR' || state === 'STOPPED') {
        matrixClient.off(ClientEvent.Sync, onSync as never)
        reject(new Error(`Matrix sync failed: ${state}`))
      }
    }

    matrixClient.on(ClientEvent.Sync, onSync as never)
  })
}

function setDefaultRoom(room: ChatRoom): void {
  navState.value.activeRoomId = room.id
  navState.value.activeChannelId = room.channels.find((channel) => channel.type === 'text')?.id ?? room.channels[0]!.id
}

function resetState(): void {
  liveState.rooms = []
  liveState.users = []

  sessionState.typingUserIds = []
  sessionState.isReady = false
  sessionState.isLoading = false
  sessionState.error = null

  navState.value.activeRoomId = ''
  navState.value.activeChannelId = ''
  navState.value.userId = ''

  cryptoState.isVerified = false
  cryptoState.pendingVerificationRequest = null
  cryptoState.keyBackupEnabled = false

  userId.value = null
}

function getOrCreateStableDeviceId() {
  if (!deviceId.value && import.meta.client) {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map((b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b % 36]!)
      .join('')

    deviceId.value = id
  }

  return deviceId
}

export function useChat() {
  const isConnected = computed(() => !!client.value)

  async function init(): Promise<void> {
    if (sessionState.isReady || !import.meta.client) return

    sessionState.isLoading = true
    sessionState.error = null

    try {
      const stableDeviceId = getOrCreateStableDeviceId()
      const credentials = await $fetch<MatrixCredentials>('/api/chat/auth', {
        query: { deviceId: stableDeviceId.value },
      })

      userId.value = credentials.userId
      navState.value.userId = credentials.userId

      const matrixClient = await initClient(credentials)

      await bootstrapCrypto(matrixClient, credentials.recoveryKey)

      matrixClient.startClient({ lazyLoadMembers: true, initialSyncLimit: 20 })
      await waitForSync(matrixClient)

      const allRooms = matrixClient.getRooms()
      const workspaceRooms = resolveWorkspaceRooms(allRooms, credentials.userId)

      liveState.rooms = workspaceRooms.map((room) => mapRoom(room, credentials.userId))
      liveState.users = deduplicateUsers(workspaceRooms)

      attachListeners(matrixClient)

      if (liveState.rooms.length > 0 && !navState.value.activeRoomId) {
        setDefaultRoom(liveState.rooms[0]!)
      }
    } catch (err) {
      console.error(err)
      sessionState.error = err instanceof Error ? err.message : 'Failed to connect'
    } finally {
      sessionState.isLoading = false
    }
  }

  async function initClient(authData: MatrixCredentials): Promise<MatrixClient> {
    if (client.value) {
      client.value.stopClient()
      client.value = null
      listenersAttached = false
    }

    const store = await createIndexedDBStore(authData.userId)
    const cryptoStore = await createIndexedDBCryptoStore(authData.userId)

    client.value = createClient({
      baseUrl: useRuntimeConfig().public.matrixUrl as string,
      userId: authData.userId,
      accessToken: authData.accessToken,
      deviceId: authData.deviceId,
      store,
      cryptoStore,
      cryptoCallbacks: {
        getSecretStorageKey: async ({ keys }) => {
          if (!authData.recoveryKey) return null

          const keyId = Object.keys(keys)[0]
          if (!keyId) return null

          return [keyId, decodeRecoveryKey(authData.recoveryKey)]
        },
      },
      logger: undefined,
      tokenRefreshFunction: async () => {
        const res = await $fetch('/api/chat/auth', {
          query: { deviceId: authData.deviceId },
        })

        // update local authData
        authData.accessToken = res.accessToken
        authData.refreshToken = res.refreshToken

        return {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        }
      },
    })

    await client.value.initRustCrypto()

    attachVerificationListeners(client.value)

    return client.value
  }

  async function selectRoom(roomId: string): Promise<void> {
    navState.value.activeRoomId = roomId

    const room = liveState.rooms.find((item) => item.id === roomId)
    if (!room) return

    navState.value.activeChannelId = room.channels.find((channel) => channel.type === 'text')?.id ?? room.channels[0]!.id
    room.unread = 0
    room.channels.forEach((channel) => {
      channel.unread = 0
    })

    if (!client.value) return

    try {
      const matrixRoom = client.value.getRoom(roomId)
      if (!matrixRoom) return

      room.messages = sortMessages(eventsToMessages(matrixRoom.getLiveTimeline().getEvents(), roomId))

      if (room.messages.length < 20) {
        await client.value.scrollback(matrixRoom, 50)
        room.messages = sortMessages(eventsToMessages(matrixRoom.getLiveTimeline().getEvents(), roomId))
      }

      const lastEvent = matrixRoom.getLiveTimeline().getEvents().at(-1)
      if (lastEvent) {
        client.value.sendReadReceipt(lastEvent).catch(() => null)
      }
    } catch {
      // non-critical
    }
  }

  function selectChannel(channelId: string): void {
    navState.value.activeChannelId = channelId
    const channel = activeRoom.value?.channels.find((item) => item.id === channelId)
    if (channel) channel.unread = 0
  }

  async function sendMessage(content: string): Promise<void> {
    if (!content.trim() || !client.value || !navState.value.activeRoomId) return

    const roomId = navState.value.activeRoomId
    const txnId = client.value.makeTxnId()

    const room = liveState.rooms.find((r) => r.id === roomId)
    if (!room) return

    room.messages.push({
      id: txnId,
      roomId,
      channelId: navState.value.activeChannelId,
      senderId: navState.value.userId,
      content,
      type: 'text',
      at: new Date(),
      readBy: [navState.value.userId],
      reactions: [],
    })

    try {
      await client.value.sendMessage(roomId, { msgtype: MsgType.Text, body: content }, txnId)
    } catch (err) {
      room.messages = room.messages.filter((message) => message.id !== txnId)
      sessionState.error = err instanceof Error ? err.message : 'Send failed'
    }
  }

  async function setTyping(typing: boolean): Promise<void> {
    if (!client.value || !navState.value.activeRoomId) return

    if (typingTimeout) clearTimeout(typingTimeout)

    await client.value.sendTyping(navState.value.activeRoomId, typing, 3000).catch(() => null)

    if (typing) {
      typingTimeout = setTimeout(() => setTyping(false), 3000)
    }
  }

  function toggleReaction(messageId: string, emoji: string): void {
    for (const room of liveState.rooms) {
      const msg = room.messages.find((message) => message.id === messageId)
      if (!msg) continue

      const existing = msg.reactions.find((reaction) => reaction.emoji === emoji)

      if (existing) {
        existing.reactedByMe = !existing.reactedByMe
        existing.count += existing.reactedByMe ? 1 : -1

        if (existing.count <= 0) {
          msg.reactions = msg.reactions.filter((reaction) => reaction.emoji !== emoji)
        }
      } else {
        msg.reactions.push({ emoji, count: 1, reactedByMe: true })
      }

      break
    }
  }

  function getUserById(id: string): ChatUser | undefined {
    return liveState.users.find((user) => user.id === id)
  }

  function formatRelativeTime(date: Date): string {
    const diff = Date.now() - date.getTime()
    if (diff < 60_000) return 'just now'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function getDayLabel(date: Date): string {
    const diff = Date.now() - date.getTime()
    if (diff < 86_400_000) return 'Today'
    if (diff < 172_800_000) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const activeRoom = computed(() => liveState.rooms.find((room) => room.id === navState.value.activeRoomId))
  const activeChannel = computed(() => activeRoom.value?.channels.find((channel) => channel.id === navState.value.activeChannelId))
  const activeMessages = computed(() => activeRoom.value?.messages.filter((message) => message.roomId === navState.value.activeRoomId && message.channelId === navState.value.activeChannelId) ?? [])
  const activeMembers = computed(() => liveState.users.filter((user) => activeRoom.value?.memberIds.includes(user.id)))
  const typingUsers = computed(() => liveState.users.filter((user) => sessionState.typingUserIds.includes(user.id)))

  const topicRooms = computed(() => liveState.rooms.filter((room) => room.type === 'topic'))
  const projectRooms = computed(() => liveState.rooms.filter((room) => room.type === 'project'))
  const contactRooms = computed(() => liveState.rooms.filter((room) => room.type === 'contact'))
  const totalUnread = computed(() => liveState.rooms.reduce((sum, room) => sum + room.unread, 0))

  const state = reactive({
    get currentUserId() {
      return navState.value.userId
    },
    get activeRoomId() {
      return navState.value.activeRoomId
    },
    get activeChannelId() {
      return navState.value.activeChannelId
    },
    get rooms() {
      return liveState.rooms
    },
    get users() {
      return liveState.users
    },
    get typingUserIds() {
      return sessionState.typingUserIds
    },
    get isReady() {
      return sessionState.isReady
    },
    get isLoading() {
      return sessionState.isLoading
    },
    get error() {
      return sessionState.error
    },
  })

  function logout(): void {
    try {
      client.value?.stopClient()
    } finally {
      client.value = null
      listenersAttached = false
      typingTimeout = null
      resetState()
    }
  }

  return {
    state,
    client,
    cryptoState,
    isConnected,
    userId,

    activeRoom,
    activeChannel,
    activeMessages,
    activeMembers,
    typingUsers,
    topicRooms,
    projectRooms,
    contactRooms,
    totalUnread,

    init,
    initClient,
    logout,

    selectRoom,
    selectChannel,
    sendMessage,
    setTyping,
    toggleReaction,

    getUserById,
    formatRelativeTime,
    getDayLabel,
  }
}
