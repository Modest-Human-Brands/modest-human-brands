function makeFolder(slug: string): DriveFolder {
  return {
    slug,
    title: 'Anime Garment',
    dateLabel: 'Oct 13, 2025',
    status: {
      label: 'Delivered',
      delivered: true,
    },
    photosCount: 16,
    videosCount: 1,
    client: {
      name: 'True Mens',
      avatarUrl: 'https://picsum.photos/seed/dfas/72/72',
    },
    previewImages: [
      `https://picsum.photos/seed/${slug}-1/240/320`,
      `https://picsum.photos/seed/${slug}-2/240/320`,
      `https://picsum.photos/seed/${slug}-3/240/320`,
      `https://picsum.photos/seed/${slug}-4/240/320`,
    ],
  }
}

export default defineEventHandler<DriveFolder[]>(() => {
  return [makeFolder('f1'), makeFolder('f2'), makeFolder('f3'), makeFolder('f4')]
})
