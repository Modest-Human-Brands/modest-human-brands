<script setup lang="ts">
definePageMeta({
  layout: 'drive',
})
function makeFolder(id: string): DriveFolder {
  return {
    id,
    title: 'Anime Garment',
    dateLabel: 'Oct 13, 2025',
    statusLabel: 'Delivered',
    delivered: true,
    photosCount: 16,
    videosCount: 1,
    client: {
      name: 'True Mens',
      avatarUrl: 'https://picsum.photos/seed/dfas/72/72',
    },
    previewImages: [`https://picsum.photos/seed/${id}-1/240/320`, `https://picsum.photos/seed/${id}-2/240/320`, `https://picsum.photos/seed/${id}-3/240/320`],
  }
}

const folders: DriveFolder[] = [makeFolder('f1'), makeFolder('f2'), makeFolder('f3'), makeFolder('f4')]
</script>

<template>
  <div class="mt-8 space-y-4">
    <ProjectFolder v-for="f in folders" :key="f.id" v-bind="f" />
  </div>
</template>
