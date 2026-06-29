<script setup lang="ts">
import type { Content } from '@tiptap/vue-3'

definePageMeta({
  layout: 'navigation-header',
  middleware: ['auth'],
})

const route = useRoute()
const slug = route.params.slug as string

const { data: doc, pending } = await useFetch(`/api/compliance/${slug}`)

const draftContent = ref<Content | null>(null)
const syncState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const isReadyForTelemetry = ref(false)

const FALLBACK_AST: Content = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

// Gatekeeper: Safely initializes DB state without triggering save loops
watchEffect(() => {
  if (doc.value && !draftContent.value) {
    draftContent.value = doc.value.content ? JSON.parse(JSON.stringify(doc.value.content)) : JSON.parse(JSON.stringify(FALLBACK_AST))

    nextTick(() => {
      isReadyForTelemetry.value = true
    })
  }
})

// Network Buffer: 1200ms debounce holds updates mid-sentence
const triggerSilentCommit = useDebounceFn(async (payloadAST: Content) => {
  try {
    await $fetch(`/api/compliance/${slug}`, {
      method: 'PUT',
      body: { content: payloadAST },
    })
    syncState.value = 'saved'
  } catch (error) {
    syncState.value = 'error'
    console.error('[Compliance AutoSave Failure]:', error)
  }
}, 1200)

watch(
  draftContent,
  (newAST) => {
    if (!isReadyForTelemetry.value || !newAST) return
    syncState.value = 'saving'
    triggerSilentCommit(newAST)
  },
  { deep: true }
)
</script>

<template>
  <main class="relative flex size-full flex-col overflow-hidden overflow-y-auto bg-dark-400 p-4 md:p-6">
    <div v-if="pending" class="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div class="h-10 w-64 animate-pulse rounded-lg bg-white/5" />
      <div class="mt-4 h-96 w-full animate-pulse rounded-xl bg-white/5" />
    </div>

    <article v-else-if="doc" class="mx-auto flex w-full max-w-4xl select-text flex-col gap-4">
      <h1 class="font-extrabold select-none text-2xl tracking-tight text-white md:text-3xl">{{ doc.title }}</h1>
      <AppEditor v-if="draftContent" v-model="draftContent" :editable="true" />
    </article>

    <div v-else class="my-auto flex flex-col items-center justify-center text-center text-light-500">
      <NuxtIcon name="local:cross" class="mb-3 text-5xl text-alert-500/50" />
      <h2 class="font-semibold text-lg text-white">Policy Not Found</h2>
      <p class="mt-1 max-w-xs text-xs">The requested compliance slug "{{ slug }}" does not exist in the system index.</p>
      <NuxtLink to="/compliance" class="font-semibold mt-4 rounded-full bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20"> Return to Directory </NuxtLink>
    </div>
  </main>
</template>
