<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const isCreating = ref(false)
const newTitle = ref('')
const newSlug = ref('')

function generateSlug(title: string) {
  newSlug.value = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

async function handleCreatePolicy() {
  if (!newTitle.value || !newSlug.value) return
  isCreating.value = true
  try {
    await $fetch('/api/compliance', {
      method: 'POST',
      body: { title: newTitle.value, slug: newSlug.value },
    })
    await navigateTo(`/compliance/${newSlug.value}`)
  } catch (error) {
    console.error('[Compliance] Policy creation failed:', error)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div class="flex size-full items-center justify-center">
    <div class="max-w-md rounded-2xl bg-dark-500 p-6" @click.stop>
      <h3 class="font-semibold mb-1 text-lg text-white">Create Compliance Policy</h3>
      <p class="mb-5 text-xs text-light-500">Draft a new governing document in the system ledger.</p>

      <form class="flex flex-col gap-4" @submit.prevent="handleCreatePolicy">
        <div class="flex flex-col gap-1.5">
          <label class="font-semibold text-[11px] uppercase tracking-wider text-light-500">Document Title</label>
          <input
            v-model="newTitle"
            type="text"
            placeholder="e.g. Service Level Agreement"
            required
            class="rounded-xl border border-white/10 bg-dark-500 px-4 py-2.5 text-sm text-white outline-none focus:border-primary-500"
            @input="generateSlug(newTitle)" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-semibold text-[11px] uppercase tracking-wider text-light-500">URL Slug</label>
          <input
            v-model="newSlug"
            type="text"
            placeholder="service-level-agreement"
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            class="font-mono rounded-xl border border-white/10 bg-dark-500 px-4 py-2 text-xs text-light-400 outline-none focus:border-primary-500" />
        </div>

        <div class="mt-4 flex items-center justify-end gap-3">
          <button type="button" class="px-4 py-2 text-xs text-light-500 hover:text-white">Cancel</button>
          <button type="submit" :disabled="isCreating" class="font-semibold rounded-xl bg-primary-500 px-5 py-2.5 text-xs text-white disabled:opacity-50">
            {{ isCreating ? 'Creating...' : 'Initialize Document' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
