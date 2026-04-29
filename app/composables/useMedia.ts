export interface Collection {
  id: string
  label: string
  description: string
  coverUrl: string
  count: number
  filter: (item: MediaItem) => boolean
}

const MOCK_MEDIA: MediaItem[] = [
  {
    slug: 'photo-coastal-001-1',
    type: 'photo',
    title: 'Coastal Dawn',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    metadata: { size: 12, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '1080p' },
  },
  {
    slug: 'photo-urban-002-1',
    type: 'photo',
    title: 'Urban Geometry',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
    metadata: { size: 8, bitDepth: '8 bit', aspectRatio: '16:9', resolution: '720p' },
  },
  {
    slug: 'video-aerial-003-1',
    type: 'video',
    title: 'Aerial Survey',
    thumbnailUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
    metadata: { size: 340, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '4320p', fps: 24 },
  },
  {
    slug: 'photo-portrait-004-1',
    type: 'photo',
    title: 'Portrait Study',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
    metadata: { size: 6, bitDepth: '8 bit', aspectRatio: '16:9', resolution: '1080p' },
  },
  {
    slug: 'photo-forest-005-1',
    type: 'photo',
    title: 'Forest Canopy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    metadata: { size: 14, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '2160p' },
  },
  {
    slug: 'video-timelapse-006-1',
    type: 'video',
    title: 'City Timelapse',
    thumbnailUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    metadata: { size: 280, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '1440p', fps: 60 },
  },
  {
    slug: 'photo-minimal-007-1',
    type: 'photo',
    title: 'Minimal Forms',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=800',
    metadata: { size: 5, bitDepth: '8 bit', aspectRatio: '16:9', resolution: '1080p' },
  },
  {
    slug: 'photo-seascape-008-1',
    type: 'photo',
    title: 'Seascape Dusk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
    metadata: { size: 18, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '2160p' },
  },
  {
    slug: 'video-nature-009-1',
    type: 'video',
    title: 'Nature Macro',
    thumbnailUrl: 'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=800',
    metadata: { size: 190, bitDepth: '8 bit', aspectRatio: '16:9', resolution: '1080p', fps: 30 },
  },
  {
    slug: 'photo-arch-010-1',
    type: 'photo',
    title: 'Architecture',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800',
    metadata: { size: 10, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '1440p' },
  },
  {
    slug: 'photo-desert-011-1',
    type: 'photo',
    title: 'Desert Light',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    metadata: { size: 16, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '2160p' },
  },
  {
    slug: 'video-ocean-012-1',
    type: 'video',
    title: 'Ocean Waves',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=800',
    metadata: { size: 420, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '4320p', fps: 24 },
  },
  {
    slug: 'photo-abstract-013-1',
    type: 'photo',
    title: 'Abstract Light',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
    metadata: { size: 7, bitDepth: '8 bit', aspectRatio: '16:9', resolution: '720p' },
  },
  {
    slug: 'photo-mountain-014-1',
    type: 'photo',
    title: 'Mountain Ridge',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    metadata: { size: 22, bitDepth: '10 bit', aspectRatio: '16:9', resolution: '2160p' },
  },
  {
    slug: 'video-street-015-1',
    type: 'video',
    title: 'Street Scene',
    thumbnailUrl: 'https://images.unsplash.com/photo-1476900164809-ff19b8ae5968?w=800',
    metadata: { size: 210, bitDepth: '8 bit', aspectRatio: '16:9', resolution: '1080p', fps: 30 },
  },
]

export function useMedia() {
  const pending = ref(false)
  const error = ref(null)
  const allMedia = computed(() => MOCK_MEDIA)

  const collections = computed<Collection[]>(() => {
    const items = allMedia.value
    if (!items.length) return []

    const photos = items.filter((m) => m.type === 'photo')
    const videos = items.filter((m) => m.type === 'video')
    const hd = items.filter((m) => ['1080p', '1440p', '2160p', '4320p'].includes(m.metadata.resolution))

    const pick = (arr: MediaItem[]) => arr[Math.floor(Math.random() * arr.length)]?.thumbnailUrl ?? ''

    return [
      {
        id: 'all',
        label: 'All Media',
        description: `${items.length} assets across all categories`,
        coverUrl: pick(items),
        count: items.length,
        filter: () => true,
      },
      photos.length
        ? {
            id: 'photography',
            label: 'Photography',
            description: `${photos.length} curated photographs`,
            coverUrl: pick(photos),
            count: photos.length,
            filter: (m) => m.type === 'photo',
          }
        : null,
      videos.length
        ? {
            id: 'videography',
            label: 'Videography',
            description: `${videos.length} video productions`,
            coverUrl: pick(videos),
            count: videos.length,
            filter: (m) => m.type === 'video',
          }
        : null,
      hd.length
        ? {
            id: 'hd',
            label: 'High Definition',
            description: `${hd.length} assets in 1080p or above`,
            coverUrl: pick(hd),
            count: hd.length,
            filter: (m) => ['1080p', '1440p', '2160p', '4320p'].includes(m.metadata.resolution),
          }
        : null,
    ].filter(Boolean) as Collection[]
  })

  function getCollection(id: string): Collection | undefined {
    return collections.value.find((c) => c.id === id)
  }

  function getMediaForCollection(id: string): MediaItem[] {
    const col = getCollection(id)
    if (!col) return []
    return allMedia.value.filter(col.filter)
  }

  function getMediaBySlug(slug: string): MediaItem | undefined {
    return allMedia.value.find((m) => m.slug === slug)
  }

  return { allMedia, collections, pending, error, getCollection, getMediaForCollection, getMediaBySlug }
}
