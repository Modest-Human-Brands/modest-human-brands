<script setup lang="ts">
import type { UseSwipeDirection } from '@vueuse/core'

definePageMeta({
  layout: false,
})

const config = useRuntimeConfig()
const route = useRoute()
const projectId = computed(() => route.params.projectId as string)
const mediaId = computed(() => route.params.mediaId as string)

const { data: projectMedia } = await useFetch(`/api/drive/${projectId.value}/media`)

const mediaItems = computed(() => projectMedia.value?.data ?? [])
const currentIndex = computed(() => mediaItems.value.findIndex((m) => m.id === mediaId.value))
const isFirst = computed(() => currentIndex.value <= 0)
const isLast = computed(() => currentIndex.value >= mediaItems.value.length - 1)
const currentItem = computed(() => mediaItems.value[currentIndex.value])

const backUrl = computed(() => `/drive/${projectId.value}`)

async function navigateToIndex(index: number) {
  const slug = mediaItems.value[index]?.id
  if (slug) await navigateTo(`/drive/${projectId.value}/${slug}`, { replace: true })
}

async function prev() {
  return await (isFirst.value ? navigateTo(backUrl.value) : navigateToIndex(currentIndex.value - 1))
}

async function next() {
  return await (isLast.value ? navigateTo(backUrl.value) : navigateToIndex(currentIndex.value + 1))
}

onKeyStroke('ArrowLeft', prev)
onKeyStroke('ArrowRight', next)

const imageEl = ref<HTMLElement | null>(null)
onMounted(() => {
  useSwipe(imageEl, {
    passive: false,
    async onSwipeEnd(_e: TouchEvent, direction: UseSwipeDirection) {
      const finalDir = await (direction === 'left' ? next() : prev())
      return finalDir
    },
  })
})

const img = useImage()

const mediaRef = useTemplateRef<HTMLElement>('mediaRef')
const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(mediaRef)

interface SpatialCoordinate {
  x: number
  y: number
}

const isCommentMode = ref(false)
const draftPin = ref<SpatialCoordinate | null>(null)
const isSubmittingComment = ref(false)
const isSidebarOpen = ref(false)
const isDrawerOpen = ref(false)
const focusedCommentId = ref<string | null>(null)
const replyText = ref('')
const isDispatchingReply = ref(false)

const { data: timelineData, refresh: refreshComments } = await useFetch(`/api/drive/${projectId.value}/media/comments/query`, {
  method: 'POST',
  body: computed(() => ({ mediaIds: [mediaId.value] })),
})

const activeThreads = computed(() => timelineData.value?.timelines?.[mediaId.value] ?? [])

watch(isDrawerOpen, (isOpen) => {
  if (!isOpen) draftPin.value = null
})

function onCanvasClick() {
  if (!isCommentMode.value) return

  if (!elementWidth.value || !elementHeight.value) return
  draftPin.value = {
    x: Number(((elementX.value / elementWidth.value) * 100).toFixed(2)),
    y: Number(((elementY.value / elementHeight.value) * 100).toFixed(2)),
  }
}

async function commitSpatialComment(text: string) {
  if (!text.trim() || !draftPin.value) return
  isSubmittingComment.value = true
  try {
    const { user } = useUserSession()

    await $fetch(`/api/drive/${projectId.value}/media/comments`, {
      method: 'POST',
      body: {
        mediaIds: [mediaId.value],
        parentId: null,
        text: text,
        coordinates: draftPin.value,
        author: {
          name: user.value?.name ?? 'Unknown',
          role: user.value?.name ? 'member' : 'visitor',
        },
      },
    })
    draftPin.value = null
    await refreshComments()
  } finally {
    isSubmittingComment.value = false
  }
}

async function commitThreadReply(targetParentId: string) {
  if (!replyText.value.trim() || isDispatchingReply.value) return
  isDispatchingReply.value = true
  try {
    const { user } = useUserSession()

    await $fetch(`/api/drive/${projectId.value}/media/comments`, {
      method: 'POST',
      body: {
        mediaIds: [mediaId.value],
        parentId: targetParentId,
        text: replyText.value,
        coordinates: null,
        author: {
          name: user.value?.name ?? 'Unknown',
          role: user.value?.name ? 'member' : 'visitor',
        },
      },
    })
    replyText.value = ''
    await refreshComments()
  } finally {
    isDispatchingReply.value = false
  }
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (draftPin.value) {
      draftPin.value = null
      e.stopPropagation()
    } else if (isDrawerOpen.value) {
      isDrawerOpen.value = false
      e.stopPropagation()
    } else {
      navigateTo(backUrl.value)
    }
  }
})

function comment() {
  isCommentMode.value = true
}

async function download() {
  const id = currentItem.value?.id
  if (!id) return

  const imageUrl = `${config.public.cdnUrl}/media/image/f_auto&q_80/${id}`

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Network response was not ok')

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = blobUrl
    a.download = currentItem.value?.filename

    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error(error)
  }
}

async function print() {
  const id = currentItem.value?.id
  if (!id) return

  const imageUrl = `${config.public.cdnUrl}/media/image/f_auto&q_80/${id}`

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(iframe)

  const iframeWindow = iframe.contentWindow
  const iframeDoc = iframeWindow?.document
  if (!iframeWindow || !iframeDoc) return

  iframeDoc.title = 'Print Image'

  const style = iframeDoc.createElement('style')
  style.textContent = `
    @media print {
      @page { margin: 0; }
      body { 
        margin: 0; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        background: white;
      }
      img { 
        max-width: 100%; 
        max-height: 100%; 
        object-fit: contain; 
      }
    }
  `
  iframeDoc.head.appendChild(style)

  const img = iframeDoc.createElement('img')
  img.onload = () => {
    iframeWindow.focus()
    iframeWindow.print()
  }

  img.src = imageUrl
  iframeDoc.body.appendChild(img)

  setTimeout(() => {
    iframe.remove()
  }, 2000)
}
</script>

<template>
  <section v-if="currentItem && currentItem.id" class="relative flex h-screen w-screen select-none overflow-hidden bg-dark-400">
    <div class="relative z-10 flex size-full flex-col md:flex-row">
      <AppSidebarPreviewList v-model:drawer-open="isSidebarOpen" :items="mediaItems" :active-id="currentItem.id" item-key="id" @select="(item) => navigateToIndex(mediaItems.indexOf(item))">
        <template #item="{ item, isActive }">
          <div class="block size-full overflow-hidden rounded transition-all duration-300" :class="isActive ? 'opacity-100 ring-[1.5px] ring-primary-500' : 'opacity-40 hover:opacity-70'">
            <NuxtImg :src="item.id" :alt="item.filename" width="128" height="128" class="w-full object-cover" loading="lazy" fit="cover" />
          </div>
        </template>
      </AppSidebarPreviewList>

      <div class="flex grow flex-col overflow-hidden" :style="{ aspectRatio: calculateAspectRatio(currentItem.metadata.aspectRatio) }">
        <div ref="imageEl" class="relative flex grow items-center justify-center overflow-hidden">
          <Transition name="media-fade" mode="out-in">
            <div ref="mediaRef" :key="currentItem.id" class="relative flex size-full items-center justify-center" :class="{ 'cursor-comment': isCommentMode }" @click.exact="onCanvasClick">
              <NuxtImg
                v-if="currentItem.type === 'photo'"
                :src="currentItem.id"
                :alt="currentItem.filename"
                height="100vh"
                loading="eager"
                preload
                :placeholder="img(currentItem.id, { width: Math.round(240 * calculateAspectRatio(currentItem.metadata.aspectRatio)), height: 240, quality: 80 })"
                class="pointer-events-auto block size-full max-h-[95vh] max-w-[95vw] object-contain transition-opacity duration-300"
                @contextmenu.prevent />

              <NuxtVideo
                v-else
                ref="videoContainerRef"
                :poster="currentItem.id"
                :media="(currentItem as any).media"
                :aspect-ratio="currentItem.metadata.aspectRatio"
                :disable-picture-in-picture="true"
                :controls="true"
                controls-list="nodownload"
                :autoplay="true"
                :muted="true"
                :playsinline="true"
                preload="metadata"
                class="pointer-events-auto relative flex size-full max-h-[95vh] max-w-[95vw] cursor-pointer items-center justify-center" />

              <div
                v-for="thread in activeThreads"
                :key="thread.commentId"
                class="group pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer"
                :style="{ left: `${thread.coordinates?.x}%`, top: `${thread.coordinates?.y}%` }">
                <div
                  class="flex size-6 items-center justify-center rounded-bl-none rounded-br-full rounded-tl-full rounded-tr-full bg-success-500 text-[10px] font-semi-bold text-black shadow-lg transition-transform hover:scale-110"
                  @click.stop="
                    () => {
                      focusedCommentId = thread.commentId
                      isDrawerOpen = true
                    }
                  ">
                  {{ thread.author.name[0] }}
                </div>

                <div class="pointer-events-none absolute left-7 top-0 z-30 hidden w-60 rounded-xl border border-white/10 bg-dark-500 p-3 text-xs shadow-2xl group-hover:block">
                  <p class="font-semi-bold text-warning-400">{{ thread.author.name }}</p>
                  <p class="mt-1 line-clamp-3 text-white">{{ thread.text }}</p>
                </div>
              </div>

              <FloatingCommentBox v-if="draftPin" :x="draftPin.x" :y="draftPin.y" :is-submitting="isSubmittingComment" @submit="commitSpatialComment" />
            </div>
          </Transition>

          <AppFloatingActionToolbar
            :page="currentIndex + 1"
            :total-pages="mediaItems.length"
            show-pagination
            show-zoom
            show-comments
            show-download
            show-print
            :comments-active="isDrawerOpen"
            @update:page="navigateToIndex($event - 1)"
            @comment="comment"
            @download="download"
            @print="print">
            <template #custom-actions> </template>
          </AppFloatingActionToolbar>
        </div>
      </div>

      <AppSidebar v-model:open="isDrawerOpen" as-drawer-on-mobile>
        <template #header>
          <div class="flex items-start justify-between px-2 pb-4 pt-2">
            <div>
              <h2 class="text-xl font-semi-bold tracking-tight text-white">Media Details</h2>
              <p class="mt-0.5 text-sm text-light-500">Properties & feedback</p>
            </div>
          </div>
        </template>

        <div class="animate-fade-in flex flex-col gap-8 px-2 pb-6">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <NuxtIcon :name="currentItem.type === 'video' ? 'local:video' : 'local:photo'" class="text-4xl text-white/20" />
              <div class="flex flex-col overflow-hidden">
                <h4 class="truncate text-base font-semi-bold text-white" :title="currentItem.filename">
                  {{ currentItem.filename }}
                </h4>
                <p class="text-sm text-light-500">{{ currentItem.formattedSize || 'Unknown Size' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="currentItem.type">
                <h4 class="mb-1 text-sm uppercase tracking-wider text-light-500">Format</h4>
                <p class="text-sm font-semi-bold uppercase text-white">{{ currentItem.type }}</p>
              </div>
              <div v-if="currentItem.metadata?.resolution">
                <h4 class="mb-1 text-sm uppercase tracking-wider text-light-500">Dimensions</h4>
                <p class="text-sm font-semi-bold text-white">{{ currentItem.metadata.resolution }}</p>
              </div>
              <div v-if="currentItem.metadata?.aspectRatio">
                <h4 class="mb-1 text-sm uppercase tracking-wider text-light-500">Aspect Ratio</h4>
                <p class="text-sm font-semi-bold text-white">{{ currentItem.metadata.aspectRatio }}</p>
              </div>
              <div v-if="currentItem.metadata?.fps">
                <h4 class="mb-1 text-sm uppercase tracking-wider text-light-500">Frame Rate</h4>
                <p class="text-sm font-semi-bold text-white">{{ currentItem.metadata.fps }} fps</p>
              </div>
              <div v-if="currentItem.status" class="col-span-2">
                <h4 class="mb-1 text-sm uppercase tracking-wider text-light-500">Status</h4>
                <span class="inline-flex rounded bg-primary-500/20 px-1.5 py-0.5 text-[9px] font-semi-bold uppercase tracking-wider text-primary-500">
                  {{ currentItem.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="h-px w-full bg-white/10" />

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semi-bold text-white">Timeline</h3>
              <span class="flex size-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-semi-bold text-white">{{ activeThreads.length }}</span>
            </div>

            <div v-if="!activeThreads.length" class="flex flex-col items-center justify-center py-8 text-center text-light-500/40">
              <NuxtIcon name="local:comment" class="mb-2 text-3xl" />
              <p class="text-sm font-semi-bold">No feedback recorded.</p>
              <p class="mt-1 text-sm text-light-500/60">Click on the canvas to pin a comment.</p>
            </div>

            <div v-else class="flex flex-col gap-4">
              <article
                v-for="thread in activeThreads"
                :key="thread.commentId"
                class="flex flex-col rounded-xl border border-white/5 bg-dark-500/40 p-4 transition-colors"
                :class="{ 'border-primary-500/50 bg-dark-500/80': focusedCommentId === thread.commentId }"
                @click="focusedCommentId = thread.commentId">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="flex size-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-semi-bold text-white">
                      {{ thread.author.name[0] }}
                    </span>
                    <span class="text-sm font-semi-bold text-white">{{ thread.author.name }}</span>
                    <span class="py-0.2 rounded bg-white/10 px-1.5 text-[9px] font-semi-bold uppercase text-light-400">
                      {{ thread.author.role }}
                    </span>
                  </div>
                  <NuxtTime :datetime="thread.createdAt" class="font-mono text-[10px] text-light-500" month="short" day="numeric" hour="2-digit" :hour12="true" minute="2-digit" />
                </div>

                <p class="mt-2 text-xs leading-relaxed text-light-600">{{ thread.text }}</p>

                <div v-if="thread.replies?.length" class="mt-4 flex flex-col gap-3 border-l-2 border-white/10 pl-3 pt-2">
                  <div v-for="reply in thread.replies" :key="reply.commentId" class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-semi-bold text-light-400">{{ reply.author.name }}</span>
                      <NuxtTime :datetime="reply.createdAt" class="font-mono text-[9px] text-light-500" month="short" day="numeric" hour="2-digit" :hour12="true" minute="2-digit" />
                    </div>
                    <p class="text-xs text-white">{{ reply.text }}</p>
                  </div>
                </div>

                <form v-if="focusedCommentId === thread.commentId" class="mt-4 flex items-center gap-2 border-t border-white/10 pt-3" @submit.prevent="commitThreadReply(thread.commentId)">
                  <input
                    v-model="replyText"
                    type="text"
                    placeholder="Reply to discussion..."
                    class="grow rounded-lg border border-white/10 bg-dark-600 px-3 py-1.5 text-xs text-white placeholder:text-light-500 focus:border-primary-500 focus:outline-none" />
                  <button
                    type="submit"
                    :disabled="!replyText.trim() || isDispatchingReply"
                    class="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semi-bold text-white transition-transform active:scale-95 disabled:opacity-40">
                    {{ isDispatchingReply ? '...' : 'Send' }}
                  </button>
                </form>
              </article>
            </div>
          </div>
        </div>
      </AppSidebar>
    </div>

    <button
      type="button"
      class="absolute left-0 top-1/2 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-white/10 bg-dark-400/80 text-white shadow-md backdrop-blur-md transition-transform active:scale-95 md:hidden"
      @click="isSidebarOpen = !isSidebarOpen">
      <NuxtIcon name="local:chevron-bold" class="text-xs" :class="{ 'scale-x-[-1]': !isSidebarOpen }" />
    </button>
  </section>
</template>

<style scoped>
.media-fade-enter-active,
.media-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.media-fade-enter-from,
.media-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

@media (min-width: 768px) {
  .imageEl {
    view-transition-name: vtn-image;
  }
}

.cursor-comment {
  cursor: url('/icons/comment.svg'), pointer;
}
</style>
