<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

definePageMeta({
  layout: false,
  middleware: ['auth'],
})

interface TimelineItem {
  id: string
  type: 'open' | 'click' | 'comment' | 'reminder' | 'sent' | string
  title: string
  description: string
  timestamp: string
}

interface EmailTelemetryAggregated {
  totalOpens: number
  totalClicks: number
  botFiltered: number
  isHoneypotTriggered: boolean
  deviceBreakdown: {
    desktop: number
    mobile: number
    unknown: number
  }
  topUrls: Record<string, number>
  locations: string[]
  firstActivity: string | null
  lastActivity: string | null
}

interface EmailInteractionDetail {
  id: string
  subject: string
  preview?: string
  description?: string
  status?: string
  date: string
  senderName: string
  senderEmail: string
  isVerified?: boolean
  recipientName?: string
  recipientEmail?: string
  recipientAvatar?: string
  recipientStatus?: string
  recipientStatusTime?: string
  attachments?: {
    name: string
    url?: string
    size?: string
  }[]
  contentHtml: string
  timeline?: TimelineItem[]
  telemetry?: EmailTelemetryAggregated | null
}

const route = useRoute()
const contentId = String(route.params.id)

const { data: email } = await useFetch<EmailInteractionDetail>(`/api/connect/email/${contentId}`)

if (!email.value) {
  throw createError({ statusCode: 404, statusMessage: 'Email message not found' })
}

const isDrawerOpen = ref(true)
const zoom = ref(100)

function zoomIn() {
  if (zoom.value < 160) zoom.value += 10
}

function zoomOut() {
  if (zoom.value > 60) zoom.value -= 10
}

function handlePrint() {
  if (!email.value?.contentHtml) return

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(email.value.contentHtml)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => iframe.remove(), 1000)
  }, 300)
}

function handleComment() {}

function handleDownload() {
  if (!email.value?.contentHtml) return

  const blob = new Blob([email.value.contentHtml], { type: 'text/html' })
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = `${email.value.subject || 'email'}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

function getInitials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isDrawerOpen.value = false
  }
})
</script>

<template>
  <main v-if="email" class="relative flex h-screen w-screen flex-row overflow-hidden bg-dark-400">
    <!-- Close / Back Button -->
    <NuxtLink to="/connect" class="absolute left-5 top-5 z-30 flex size-9 items-center justify-center rounded-lg bg-dark-500/80 text-light-400 backdrop-blur transition-colors hover:text-white">
      <NuxtIcon name="local:cross" class="text-sm" />
    </NuxtLink>

    <!-- Main Viewport / Email Content Preview -->
    <section class="relative flex flex-1 flex-col items-center justify-between overflow-hidden bg-dark-400">
      <!-- <div class="flex size-full items-start justify-center overflow-y-auto scrollbar-hidden px-4 pb-28 pt-16 md:px-12">
        <div class="relative w-full max-w-2xl bg-white p-6 text-black transition-transform duration-200 md:p-8"
          :style="{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }">
          <div class="overflow-x-auto text-black" v-html="email.contentHtml" />
        </div>
      </div> -->
      <ConnectPreviewPanel :id="contentId" :content-html="email.contentHtml" />

      <AppFloatingActionToolbar
        :page="1"
        :total-pages="1"
        :fit-mode="'auto'"
        show-pagination
        show-zoom
        show-comments
        show-download
        show-print
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @comment="handleComment"
        @download="handleDownload"
        @print="handlePrint">
        <template #custom-actions>
          <slot name="toolbar-actions" />
        </template>
      </AppFloatingActionToolbar>
    </section>

    <!-- Right Sidebar -->
    <AppSidebar v-model:open="isDrawerOpen" as-drawer-on-mobile>
      <template #header>
        <div class="flex items-start justify-between px-2 pb-4 pt-2">
          <div>
            <h2 class="text-xl font-semi-bold tracking-tight text-white">Email Details</h2>
            <p class="mt-0.5 text-sm text-light-500">{{ email.subject }}</p>
          </div>
        </div>
      </template>

      <div class="animate-fade-in flex flex-col gap-6 px-4 pb-8 pt-4">
        <!-- Meta Indicators -->
        <div class="flex items-center gap-4 text-xs font-semi-bold text-light-400">
          <div class="flex items-center gap-1.5">
            <NuxtIcon name="local:clock" class="text-sm text-light-500" />
            <NuxtTime :datetime="email.date" relative />
          </div>
          <div v-if="email.isVerified" class="flex items-center gap-1 text-success-500">
            <NuxtIcon name="local:check" class="text-sm" />
            <span>Verified Sender</span>
          </div>
          <div class="flex items-center gap-1.5">
            <NuxtIcon name="local:paperclip" class="text-sm text-light-500" />
            <span>{{ email.attachments?.length || 0 }} Attachment</span>
          </div>
        </div>

        <!-- Recipient Card -->
        <div class="flex items-center justify-between rounded-xl border border-dark-400 bg-dark-500/50 p-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-dark-600 text-xs font-bold text-white">
              <NuxtImg v-if="email.recipientAvatar" :src="email.recipientAvatar" :alt="email.recipientName" class="size-full rounded-full object-cover" />
              <span v-else>{{ getInitials(email.recipientName) }}</span>
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="truncate text-sm font-semi-bold text-white">
                {{ email.recipientName }}
              </span>
              <span class="truncate text-xs text-light-400">
                {{ email.recipientEmail }}
              </span>
            </div>
          </div>

          <div class="flex shrink-0 flex-col items-end gap-1">
            <span class="rounded px-2 py-0.5 text-[10px] font-semi-bold" :class="email.recipientStatus === 'Clicked' ? 'bg-success-500/20 text-success-500' : 'bg-success-500/20 text-success-500'">
              {{ email.recipientStatus }}
            </span>
            <NuxtTime v-if="email.recipientStatusTime" :datetime="email.recipientStatusTime" hour="numeric" minute="2-digit" class="text-[11px] text-light-500" />
          </div>
        </div>

        <!-- Engagement Overview Card -->
        <div v-if="email.telemetry" class="grid grid-cols-2 gap-2 rounded-xl border border-dark-400 bg-dark-500/30 p-3 text-center">
          <div class="flex flex-col border-r border-white/10">
            <span class="text-xs text-light-500">Total Opens</span>
            <span class="text-lg font-bold text-white">{{ email.telemetry.totalOpens }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-light-500">Total Clicks</span>
            <span class="text-lg font-bold text-success-500">{{ email.telemetry.totalClicks }}</span>
          </div>
          <div v-if="email.telemetry.deviceBreakdown" class="col-span-2 mt-1 border-t border-white/5 pt-2 text-[11px] text-light-400">
            <span>Desktop: {{ email.telemetry.deviceBreakdown.desktop }} · Mobile: {{ email.telemetry.deviceBreakdown.mobile }}</span>
            <span v-if="email.telemetry.botFiltered" class="ml-1 text-light-500">({{ email.telemetry.botFiltered }} bot filtered)</span>
          </div>
        </div>

        <div class="h-px w-full bg-white/10" />

        <!-- Activity Timeline -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semi-bold text-white">Activity Timeline</h3>
            <span class="text-xs text-light-500">{{ email.timeline?.length }}</span>
          </div>

          <div class="relative flex flex-col gap-5">
            <div v-for="item in email.timeline" :key="item.id" class="flex items-start justify-between gap-3 text-xs">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 flex size-5 shrink-0 items-center justify-center text-light-400">
                  <NuxtIcon
                    :name="
                      item.type === 'open' ? 'local:eye' : item.type === 'click' ? 'local:link' : item.type === 'comment' ? 'local:comment' : item.type === 'reminder' ? 'local:send' : 'local:mail'
                    "
                    class="text-sm" />
                </div>
                <div class="flex flex-col">
                  <span class="font-semi-bold text-white">{{ item.title }}</span>
                  <span class="mt-0.5 text-[11px] text-light-400">{{ item.description }}</span>
                </div>
              </div>
              <NuxtTime :datetime="item.timestamp" hour="numeric" minute="2-digit" class="shrink-0 text-[11px] text-light-500" />
            </div>
          </div>
        </div>
      </div>
    </AppSidebar>
  </main>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
