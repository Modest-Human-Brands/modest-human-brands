<script setup lang="ts">
export interface ComplianceRowItem {
  id: string
  slug: string
  title: string
  updatedAt?: string
}

defineProps<{
  item: ComplianceRowItem
}>()
</script>

<template>
  <NuxtLink
    :to="`/compliance/${item.slug}`"
    class="group grid grid-cols-[1fr_auto] items-center border-b border-white/5 px-6 py-4 text-sm transition-colors hover:bg-white/5 md:grid-cols-[2.5fr_1.5fr_1.5fr_1fr_60px]">
    <div class="flex items-center gap-2 truncate pr-4">
      <NuxtIcon name="local:folder" class="shrink-0 text-[28px] text-light-500 transition-colors group-hover:text-primary-400" />
      <span class="truncate text-base font-semi-bold text-white group-hover:underline">{{ item.title }}</span>
    </div>

    <div class="font-mono hidden truncate pr-4 text-light-400 md:block">
      {{ item.slug }}
    </div>

    <div class="hidden text-light-400 md:block">
      <span v-if="item.updatedAt">
        <NuxtTime :datetime="item.updatedAt" month="short" day="numeric" year="numeric" hour="2-digit" minute="2-digit" />
      </span>
      <span v-else class="text-light-600">—</span>
    </div>

    <div class="hidden items-center gap-1.5 text-success-400 md:flex">
      <span class="size-1.5 rounded-full bg-success-500" />
      <span>Updated</span>
    </div>

    <div class="flex justify-end text-light-500 transition-colors group-hover:text-white">
      <NuxtIcon name="local:chevron-bold" class="scale-x-[-1] text-xs" />
    </div>
  </NuxtLink>
</template>
