<script setup lang="ts">
const props = defineProps<{
  projectSlug: string
  mediaItems: MediaItem[]
  activeMediaSlug: string
  vertical?: boolean
}>()

const listEl = ref<HTMLUListElement>()
const x = ref<number>(0)
const y = ref<number>(0)
const { width, height } = useWindowSize()

async function scrollToActive(slug: string) {
  // get width of current image
  const currentMedia = props.mediaItems!.filter((item) => item.slug === slug)
  const index = props.mediaItems!.indexOf(currentMedia[0]!) as number

  const imgToMove = ref<HTMLElement | undefined>(listEl.value?.children[index] as HTMLElement | undefined)

  const imageWidth = imgToMove.value?.offsetWidth
  const imageHeight = imgToMove.value?.offsetWidth

  if (imageWidth === undefined || imageHeight === undefined) return

  // calculate translate to do. (current translate + middle screen pos x - middle thumbnail to move pos x)
  if (props.vertical) y.value = y.value + (height.value / 2 - (imgToMove.value!.getBoundingClientRect().top + imageHeight / 2))
  else x.value = x.value + (width.value / 2 - (imgToMove.value!.getBoundingClientRect().left + imageWidth / 2))
}

onMounted(() => scrollToActive(props.activeMediaSlug))
watch(
  () => props.activeMediaSlug,
  () => scrollToActive(props.activeMediaSlug)
)
</script>

<template>
  <aside
    :class="[
      vertical ? 'relative hidden w-[72px] shrink-0 flex-col border-r border-white/5 backdrop-blur-sm md:flex' : 'relative flex h-[68px] shrink-0 border-t border-white/5 backdrop-blur-sm md:hidden',
    ]">
    <nav class="scrollbar-hidden" :class="vertical ? 'h-full overflow-y-auto overflow-x-hidden' : 'w-full overflow-x-auto overflow-y-hidden'">
      <ul ref="listEl" class="flex gap-1.5 p-1.5" :class="vertical ? 'flex-col' : 'flex-row items-center'">
        <li v-for="media in mediaItems" :key="media.slug" class="shrink-0" :style="`transform: translateX(${x}px)  translateY(${y}px)translateZ(0)`">
          <NuxtLink
            :to="`/drive/${projectSlug}/${media.slug}`"
            class="block overflow-hidden rounded transition-all duration-300"
            :class="[vertical ? 'w-14' : 'h-14', media.slug === activeMediaSlug ? 'scale-105 opacity-100 ring-[1.5px] ring-primary-500' : 'opacity-40 hover:scale-105 hover:opacity-70']">
            <NuxtImg :src="media.thumbnailUrl" :alt="media.title" :width="56" :height="56" class="size-14 object-cover" loading="lazy" fit="cover" />
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>
