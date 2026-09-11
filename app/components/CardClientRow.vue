<script setup lang="ts">
const props = defineProps<{
  item: ClientItem
}>()

const displayName = computed(() => {
  if (props.item.name && props.item.name !== 'Unknown') return props.item.name
  if (props.item.pocName && props.item.pocName !== 'Unknown') return props.item.pocName
  if (props.item.company && props.item.company !== 'Unknown') return props.item.company
  return props.item.email || 'Untitled'
})

const subtitle = computed(() => {
  const parts: string[] = []
  if (props.item.company && props.item.company !== 'Unknown') {
    parts.push(props.item.company)
  }
  if (props.item.pocName && props.item.pocName !== 'Unknown' && props.item.pocName !== displayName.value) {
    parts.push(`PoC: ${props.item.pocName}`)
  }
  return parts.join(' · ')
})

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CL'
  )
}
</script>

<template>
  <div class="group flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-dark-500/40 p-4 transition-colors hover:border-white/20 hover:bg-dark-500 md:flex-row md:items-center">
    <!-- Left: Identity & Metadata -->
    <div class="flex min-w-0 items-center gap-3.5">
      <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-dark-600 text-sm font-semi-bold text-white">
        <NuxtImg v-if="item.avatar" :src="item.avatar" :alt="displayName" class="size-full rounded-full object-cover" />
        <span v-else>{{ getInitials(displayName) }}</span>
      </div>

      <div class="flex min-w-0 flex-col">
        <div class="flex flex-wrap items-center gap-2">
          <span class="truncate text-base font-semi-bold text-white">{{ displayName }}</span>
          <span class="rounded px-2 py-0.5 text-xs font-semi-bold" :class="item.type === 'Brand' ? 'bg-accent-500/20 text-accent-400' : 'bg-white/10 text-light-400'">
            {{ item.type }}
          </span>
          <span v-if="item.status" class="rounded px-2 py-0.5 text-xs font-semi-bold" :class="item.status === 'Active' ? 'bg-success-500/20 text-success-500' : 'bg-white/10 text-light-400'">
            {{ item.status }}
          </span>
        </div>

        <p v-if="subtitle" class="text-sm text-light-400">
          {{ subtitle }}
        </p>

        <p v-if="item.lastMessageSnippet" class="mt-1 line-clamp-1 text-sm text-light-500">
          {{ item.lastMessageSnippet }}
        </p>
      </div>
    </div>

    <!-- Right: Contact info, tags & timestamp -->
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-3 md:border-t-0 md:pt-0">
      <!-- Tags -->
      <div v-if="item.tags && item.tags.length > 0" class="hidden flex-wrap gap-1.5 lg:flex">
        <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="rounded-md bg-white/5 px-2 py-1 text-xs text-light-400">
          {{ tag }}
        </span>
      </div>

      <!-- Contact details -->
      <div class="flex flex-col text-left md:text-right">
        <a v-if="item.email" :href="`mailto:${item.email}`" class="text-sm text-white transition-colors hover:text-accent-400">
          {{ item.email }}
        </a>
        <a v-if="item.phone" :href="`tel:${item.phone}`" class="text-xs text-light-400 transition-colors hover:text-white">
          {{ item.phone }}
        </a>
      </div>

      <!-- Timestamp -->
      <div class="flex items-center gap-1.5 text-xs text-light-500">
        <NuxtIcon name="local:clock" class="text-sm text-light-500" />
        <NuxtTime :datetime="item.lastActive" relative />
      </div>
    </div>
  </div>
</template>
