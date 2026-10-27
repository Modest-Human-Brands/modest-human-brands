<script setup lang="ts">
const props = defineProps<{
  projectId: string
  kind: 'script' | 'storyboard' | 'look'
  item: ProjectItem
}>()

const { copy } = useClipboard()

const path = computed(() => `/project/${props.projectId}/pre-production/${props.kind}?item=${props.item.id}`)

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

async function share(): Promise<void> {
  await copy(`${window.location.origin}${path.value}`)
}
</script>

<template>
  <!-- Figma: Card/Item, same 256 card as the Pre-Production board; the kind chip replaces the status -->
  <article class="relative min-h-[256px] w-64 shrink-0 overflow-hidden rounded bg-dark-500">
    <NuxtLink :to="path" class="block">
      <div class="relative aspect-[2/1] w-full overflow-hidden bg-dark-600">
        <NuxtImg v-if="item.imageId" :src="item.imageId" :alt="item.title" width="480" class="size-full object-cover object-top" />
        <img v-else :src="placeholderImage(item.index)" :alt="item.title" class="size-full object-cover" />
        <span class="absolute left-1 top-1 rounded bg-dark-500 px-2 pb-[3px] pt-0.5 text-2xs">#{{ item.index }}</span>
        <span v-if="item.duration" class="absolute right-1 top-1 rounded bg-dark-500 px-2 pb-[3px] pt-0.5 text-2xs">{{ item.duration }}</span>
      </div>

      <div class="flex flex-col gap-1 px-2 pb-9 pt-2">
        <div class="flex items-start justify-between gap-2">
          <h3 class="min-w-0 truncate text-sm text-white">{{ item.title }}</h3>
          <span class="shrink-0 rounded bg-info-600 px-2 pb-[3px] pt-0.5 text-2xs capitalize">{{ kind }}</span>
        </div>
        <p v-if="item.specs" class="line-clamp-3 text-xs text-white/60">{{ item.specs }}</p>
        <div v-if="itemLabels(item, kind).length" class="flex items-center gap-1.5 overflow-hidden pt-1">
          <span v-for="tag in itemLabels(item, kind)" :key="tag" class="inline-flex shrink-0 items-center whitespace-nowrap rounded bg-dark-600 px-2 py-1 text-xs text-white">{{ tag }}</span>
        </div>
      </div>
    </NuxtLink>

    <div class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between pl-2">
      <div class="mb-2 flex -space-x-2">
        <span
          v-for="collab in item.collaborators"
          :key="collab.id"
          class="flex size-6 items-center justify-center overflow-hidden rounded-full border-2 border-dark-500 bg-dark-600 text-2xs text-white"
          :title="collab.name">
          <img v-if="collab.avatar" :src="collab.avatar" :alt="collab.name" class="size-full object-cover" />
          <span v-else>{{ initials(collab.name) }}</span>
        </span>
      </div>
      <button type="button" class="pointer-events-auto flex items-center gap-1 rounded-tl-md bg-accent-500 px-2 py-1 text-2xs text-white hover:bg-accent-600" @click="share">
        <NuxtIcon name="local:link" class="shrink-0 text-base" />
        Share
      </button>
    </div>
  </article>
</template>
