<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const { data: templates, pending } = await useFetch('/api/doc/template')
</script>

<template>
  <section class="relative flex h-full flex-col overflow-y-auto px-4 py-8 md:px-8">
    <header class="mb-8 flex flex-col gap-2">
      <h1 class="text-xl font-semi-bold tracking-tight text-white md:text-2xl">Document Templates</h1>
      <p class="text-sm text-light-500">Select a template to begin generating a new document.</p>
    </header>

    <div v-if="pending" class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 4" :key="i" class="aspect-[4/3] animate-pulse rounded-2xl bg-dark-500" />
    </div>

    <div v-else-if="!templates?.length" class="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <p class="text-xl font-semi-bold text-white md:text-2xl">No Templates Found</p>
      <p class="mt-2 text-sm text-light-500">Create a document template in the system to get started.</p>
    </div>

    <div v-else class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DocTemplateCard v-for="template in templates" :key="template.id" :template="template" />
    </div>
  </section>
</template>
