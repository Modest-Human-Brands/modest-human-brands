export default defineEventHandler<Promise<ProjectDetail>>(async () => {
  return {
    id: 'proj-1',
    slug: 'anime-garment',
    title: 'Anime Garment',
    client: {
      name: 'True Mens',
      avatarUrl: 'https://picsum.photos/seed/client2/72/72',
    },
    status: {
      label: 'Delivered',
      delivered: true,
    },
    photosCount: 16,
    videosCount: 1,
    mediaItems: await $fetch<MediaItem[]>('/api/media', {
      baseURL: 'http://localhost:3045',
    }),
  }
})
