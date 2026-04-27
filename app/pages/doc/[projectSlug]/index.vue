<script setup lang="ts">
definePageMeta({
  layout: 'navigation',
  middleware: ['auth'],
})

const route = useRoute()
const slug = route.params.projectSlug!.toString()

const { data: project } = await useFetch(`/api/document/${slug}`)

async function sendEmail() {
  await navigateTo('/connect')
}
</script>

<template>
  <section class="flex w-full grow flex-col gap-4 p-2 md:p-4">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div class="flex flex-col gap-1">
        <h1 class="font-semibold text-2xl tracking-tight md:text-3xl">{{ project?.title }}</h1>
        <p class="text-gray-500">{{ project?.client?.name }}</p>
        <div class="text-gray-500 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span class="flex items-center gap-1.5"> {{ project?.documentCount }} Documents </span>
          <span class="flex items-center gap-1.5">
            Updated
            <NuxtTime :datetime="project?.date!" relative />
          </span>
        </div>
      </div>
    </div>

    <div class="relative w-full grow overflow-y-auto">
      <div class="inline-block min-w-full align-middle">
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0">
            <thead>
              <tr class="whitespace-nowrap text-sm">
                <th class="font-medium sticky top-0 z-10 bg-dark-400 pb-4 pr-4 text-left">Name</th>
                <th class="font-medium sticky top-0 z-10 bg-dark-400 px-4 pb-4">Last updated</th>
                <th class="font-medium sticky top-0 z-10 bg-dark-400 px-4 pb-4">Size</th>
                <th class="font-medium sticky top-0 z-10 bg-dark-400 pb-4 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="document in project?.documentItems" :key="document.id" class="group hover:bg-white/[0.02]">
                <td class="py-4 pr-4">
                  <NuxtLink :to="`/doc/${slug}/${document.id}`" class="flex items-center gap-3 text-left md:gap-4">
                    <NuxtIcon name="local:document" class="shrink-0 text-2xl md:text-[32px]" />
                    <div class="flex min-w-0 flex-col">
                      <span class="font-medium text-gray-200 truncate text-sm md:text-base">{{ document.name }}</span>
                      <span class="text-gray-500 text-xs capitalize">
                        {{ document.extension }}
                      </span>
                    </div>
                  </NuxtLink>
                </td>
                <td class="whitespace-nowrap px-4 py-4">
                  <div class="flex flex-col items-center text-sm">
                    <span class="text-gray-300">
                      <NuxtTime :datetime="document.updatedAt" relative />
                    </span>
                    <span class="text-gray-600 hidden text-xs sm:block">
                      <NuxtTime :datetime="document.updatedAt" format="MMM D, YYYY h:mm A" />
                    </span>
                  </div>
                </td>
                <td class="text-gray-500 whitespace-nowrap px-4 py-4 text-center text-sm">
                  {{ document.sizeBytes }}
                </td>
                <td class="py-4 pl-4 text-right">
                  <button class="text-gray-600 p-2 transition-colors hover:text-white" @click="sendEmail">
                    <NuxtIcon name="local:dots" class="text-xl" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
th {
  background-clip: padding-box;
}
</style>
