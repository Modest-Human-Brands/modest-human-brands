<script setup lang="ts">
const props = defineProps<{
  id: string
  currentIndex: number
  totalCount: number
  subject: string
  senderName: string
  senderEmail: string
  senderAvatarUrl?: string
  isVerified?: boolean
  date: string
  contentHtml: string
}>()

defineEmits(['next', 'prev'])

const actionIcons = ['local:star', 'local:print', 'local:trash', 'local:zoom-fit']

const timeAgo = useTimeAgo(() => new Date(props.date))
const formattedDate = useDateFormat(() => new Date(props.date), 'MMMM D, h:mm A')
</script>

<template>
  <section class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-2xl bg-dark-500">
    <header class="flex flex-col gap-6 p-6 pb-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-5 text-xs">
          <span>{{ currentIndex }} of {{ totalCount }}</span>
          <div class="flex items-center gap-4">
            <button type="button" class="transition-colors hover:text-white" @click="$emit('prev')">
              <NuxtIcon name="local:chevron-bold" class="text-base" />
            </button>
            <button type="button" class="transition-colors hover:text-white" @click="$emit('next')">
              <NuxtIcon name="local:chevron-bold" class="rotate-180 text-base" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <template v-for="icon in actionIcons" :key="icon">
            <NuxtLink v-if="icon === 'local:zoom-fit'" :to="`/connect/email/${id}`" class="transition-colors hover:text-white">
              <NuxtIcon :name="icon" class="text-xl" />
            </NuxtLink>
            <button v-else type="button" class="transition-colors hover:text-white">
              <NuxtIcon :name="icon" class="text-xl" />
            </button>
          </template>
        </div>
      </div>

      <h2 class="text-2xl font-semi-bold text-white">{{ subject }}</h2>

      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <img v-if="senderAvatarUrl" :src="senderAvatarUrl" alt="" class="size-10 rounded-full object-cover" loading="lazy" />
          <div v-else class="text-3xs flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-bold uppercase text-black">
            {{ senderName.charAt(0) }}
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-semi-bold">{{ senderName }}</span>
              <NuxtIcon v-if="isVerified" name="local:approved" class="text-base text-warning-500" />
            </div>
            <span class="mt-1 text-sm opacity-60">{{ senderEmail }}</span>
          </div>
        </div>

        <div class="flex flex-col items-end text-right">
          <span class="text-sm">{{ formattedDate }}</span>
          <span class="mt-1 text-sm opacity-60">{{ timeAgo }}</span>
        </div>
      </div>
    </header>

    <div class="scrollbar-hidden flex-1 overflow-y-auto px-6 pb-6">
      <div class="emailHtmlContainer min-h-full w-full overflow-hidden rounded-lg p-6 [&_table]:border-separate [&_table]:border-spacing-0" v-html="contentHtml" />
    </div>
  </section>
</template>
