export type NavItem = {
  id: string
  label: string
  icon: string
  to?: string
}

export type Collaborator = {
  id: string
  name: string
  avatarUrl: string
}

export interface ProjectClient {
  name: string
  avatarUrl: string
}

export type ProjectStatus = 'Plan' | 'Quotation' | 'Shoot' | 'Edit' | 'Delivered'

export type Orientation = 'portrait' | 'landscape'

export interface Photo {
  id: string
  title: string
  image?: string
  description: string
  gallery: boolean
  featured: null | number
  aspectRatio: number
  url: string
}

export interface PhotoDetails extends Omit<Photo, 'featured' | 'gallery'> {
  title: string
}

export const codecs = ['avc', 'vp9', 'hevc', 'av1'] as const
export type Codec = (typeof codecs)[number]

export const resolutions = ['1440p', '1080p', '720p'] as const
export type Resolution = (typeof resolutions)[number]

export type FileSources = {
  [codec in Codec]?: { type: string; orientation: Orientation[] }
}

export interface Source {
  src: string
  type: string
  media: string
  codec: Codec
  orientation: Orientation
  // resolution: Resolution
}

export interface Video {
  id: string
  title: string
  description: string
  type: 'hero' | 'feature'
  media: string
  poster?: string
  aspectRatio: number
  duration: number
  gallery: boolean
  featured: null | number
  url: string
  uploadDate: string
}

export interface VideoDetails extends Video {
  title: string
}

/* Server Only */
export const resourceTypes = ['client', 'project', 'asset'] as const

export type ResourceType = (typeof resourceTypes)[number]

export type NotionDB = { [K in ResourceType]: string }

type NotionImage =
  | {
      type: 'file'
      file: {
        url: string
        expiry_time: string
      }
    }
  | {
      type: 'external'
      external: {
        url: string
      }
    }
  | null

export interface NotionProjectClient {
  id: string
  created_time: Date
  last_edited_time: Date
  cover: NotionImage
  icon: NotionImage
  properties: {
    Name: {
      type: 'title'
      title: {
        plain_text: string
      }[]
    }
    Company: {
      type: 'rich_text'
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
    Address: {
      type: 'rich_text'
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
    Website: {
      type: 'url'
      url: string
    }
    Instagram: {
      type: 'url'
      url: string
    }
    LinkedIn: {
      type: 'url'
      url: string
    }
    'Point of Contact': {
      type: 'select'
      select: {
        name: string
        color: string
      }
    }
    Email: {
      type: 'email'
      email: string
    }
    Whatsapp: {
      type: 'phone_number'
      phone_number: string
    }
    Phone: {
      type: 'phone_number'
      phone_number: string
    }
    Project: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
    Profit: {
      type: 'rollup'
      rollup: {
        type: string
        number: null
        function: string
      }
    }
  }
  url: string
  public_url: null
}

export interface NotionProject {
  id: string
  created_time: Date
  last_edited_time: Date
  cover: NotionImage
  icon: NotionImage
  properties: {
    Index: {
      type: 'number'
      number: number
    }
    Name: {
      type: 'title'
      title: {
        plain_text: string
      }[]
    }
    Slug: {
      type: 'formula'
      formula: { string: string }
    }
    Status: {
      type: 'status'
      status: {
        name: 'Plan' | 'Quotation' | 'Shoot' | 'Edit' | 'Delivered'
      }
    }
    Quotation: {
      type: 'number'
      number: number
    }
    Address: {
      type: 'rich_text'
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
    Date: {
      type: 'date'
      date: {
        start: string
      }
    }
    Client: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
    Budget: {
      type: 'number'
      number: number
    }
    Asset: {
      type: 'relation'
      relation: { id: string }[]
      has_more: boolean
    }
  }
  url: string
  public_url: null
}

export interface NotionAsset {
  id: string
  created_time: string
  last_edited_time: string
  cover: NotionImage
  icon: NotionImage
  properties: {
    'Project Index': {
      type: 'rollup'
      rollup: {
        array: {
          number: number
        }[]
      }
    }
    Index: {
      type: 'number'
      number: number
    }
    Name: {
      type: 'title'
      title: {
        plain_text: string
      }[]
    }
    Slug: {
      type: 'formula'
      formula: { string: string }
    }
    Description: {
      type: 'rich_text'
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
    Type: {
      type: 'select'
      select: {
        name: 'Photo' | 'Video'
      }
    }
    Segment: {
      type: 'select'
      select: {
        name: Category
      }
    }
    Status: {
      type: 'select'
      status: {
        name: 'Plan' | 'Draft' | 'Release' | 'Archive'
      }
    }
    Project: {
      type: 'relation'
      relation: { id: string }[]
      has_more: false
    }
    'Project Slug': {
      type: 'rollup'
      rollup: {
        array: {
          formula: {
            string: string
          }
        }[]
      }
    }
    Gallery: {
      type: 'checkbox'
      checkbox: boolean
    }
    Featured: {
      type: 'number'
      number: number
    }
    Resolution: {
      type: 'select'
      select: {
        name: Resolution
      }
    }
    'Aspect ratio': {
      type: 'select'
      select: {
        name: AspectRatio
      }
    }
    Additional: {
      type: 'rich_text'
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
  }
}
