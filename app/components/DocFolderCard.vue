<script setup lang="ts">
export interface DocFolder {
  id: string
  title: string
  contactName: string
  contactAvatar?: string | null
  status: string
  itemCount: number
}

defineProps<{ folder: DocFolder }>()

const getStatusColor = (status: string) => {
  const normalized = status.toUpperCase()
  const map: Record<string, string> = {
    COMPLETED: 'bg-success-500',
    DELIVERED: 'bg-success-500',
    DRAFT: 'bg-warning-500',
    SENT: 'bg-primary-500',
    VOID: 'bg-alert-500',
  }
  return map[normalized] || 'bg-light-500'
}

const formatStatus = (status: string) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}
</script>

<template>
  <NuxtLink :to="`/doc/${folder.id}`" class="group flex max-w-48 cursor-pointer flex-col gap-2">
    <div class="relative w-full transition-transform duration-300 group-hover:-translate-y-1">
      <img src="/images/folder.png" class="h-auto w-full select-none object-contain" :alt="`${folder.contactName} folder`" draggable="false" loading="lazy" />
      <div class="absolute bottom-2.5 left-2.5 flex items-center gap-2">
        <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-center text-2xs font-bold leading-tight tracking-wide text-white ring-1 ring-white/10">
          <img v-if="folder.contactAvatar" :src="folder.contactAvatar" class="h-full w-full object-cover" />
          <span v-else>{{ folder.contactName.substring(0, 2).toUpperCase() }}</span>
        </div>
        <span class="text-sm font-bold text-white/80">{{ folder.contactName }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-1 px-1">
      <h3 class="truncate text-base font-bold text-white">{{ folder.title }}</h3>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <div :class="['size-2.5 rounded-full', getStatusColor(folder.status)]"></div>
          <span class="text-sm font-bold text-white/60">{{ formatStatus(folder.status) }}</span>
        </div>
        <span class="font-semibold text-sm text-white/40">{{ folder.itemCount }} Items</span>
      </div>
    </div>
  </NuxtLink>
</template>
