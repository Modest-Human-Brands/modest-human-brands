<script setup lang="ts">
defineProps<{
  orgSlug: string
  documentCollection: ProjectDocumentCollection
  index: number
}>()

function avatarLetter(title: string) {
  return title.charAt(0).toUpperCase()
}

const openMenuId = ref<string | null>(null)
function toggleMenu(slug: string, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  openMenuId.value = openMenuId.value === slug ? null : slug
}

if (import.meta.client) {
  window.addEventListener('click', () => {
    openMenuId.value = null
  })
}
</script>

<template>
  <div class="hover:ring-gray-700 group relative flex flex-col rounded-xl bg-dark-500 transition-all hover:ring-1">
    <NuxtLink :to="`/doc/${documentCollection.slug}`" class="flex flex-col gap-4 p-4 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex w-full min-w-0 items-center gap-3 sm:gap-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold leading-none text-dark-400">
            {{ avatarLetter(documentCollection.title) }}
          </div>

          <div class="flex min-w-0 grow flex-col">
            <h3 class="truncate text-sm text-white transition-colors group-hover:text-primary-400 sm:text-[15px]">
              {{ documentCollection.title }}
            </h3>
            <p v-if="documentCollection.client?.name" class="text-gray-500 truncate text-xs sm:text-sm">
              {{ documentCollection.client?.name }}
            </p>
          </div>
        </div>

        <div class="relative shrink-0">
          <button class="text-gray-500 -mr-1.5 rounded-md p-1.5 transition-colors hover:bg-white/5 hover:text-white" @click="toggleMenu(documentCollection.slug, $event)">
            <NuxtIcon name="local:dots" class="text-xl" />
          </button>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <div v-if="openMenuId === documentCollection.slug" class="absolute right-0 top-10 z-20 w-36 rounded-lg bg-[#18181b] p-1.5 shadow-2xl ring-1 ring-white/10" @click.stop>
              <button class="text-gray-300 w-full rounded-md px-3 py-2 text-left text-xs hover:bg-white/5 sm:text-sm">Edit</button>
              <button class="text-red-400 hover:bg-red-400/10 w-full rounded-md px-3 py-2 text-left text-xs sm:text-sm">Delete</button>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex flex-col gap-2 border-t border-white/5 pt-4">
        <div class="text-gray-400 flex items-center gap-2 text-sm">
          <NuxtIcon name="local:document" class="shrink-0 text-[18px]" />
          <span class="truncate">{{ documentCollection.documentCount }} Documents</span>
        </div>
        <div class="text-gray-400 flex items-center gap-2 text-sm">
          <NuxtIcon name="local:hour" class="shrink-0 text-[18px]" />
          <span class="truncate">
            Updated
            <NuxtTime :datetime="documentCollection.date" relative />
          </span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
