<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId as string

const { data: project } = await useFetch(`/api/project/${projectId}`)

const editedAt = computed(() => project.value?.updatedAt ?? new Date().toISOString())
const { data: collaborators } = await useFetch('/api/user', { default: () => [] })
</script>

<template>
  <div class="flex h-dvh w-screen flex-col overflow-hidden bg-dark-400">
    <header class="flex shrink-0 items-center justify-between gap-4 px-4 py-4 md:px-8">
      <div class="flex items-center gap-4">
        <NuxtLink :to="`/project/${projectId}/pre-production`" aria-label="Close" class="rounded-full p-1 text-white hover:bg-white/10">
          <NuxtIcon name="local:cross" class="text-2xl" />
        </NuxtLink>
        <NuxtIcon name="local:target" class="text-4xl md:text-[48px]" />
        <span class="whitespace-nowrap text-xl md:text-[40px]">{{ project?.title }}</span>
      </div>
      <AppActivitybar :edited-at="editedAt" :collaborators="collaborators" />
    </header>

    <main class="relative isolate flex min-h-0 grow flex-col overflow-hidden">
      <slot />
    </main>
  </div>
</template>
