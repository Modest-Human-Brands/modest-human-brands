export interface OrganizationBranding {
  logo: string
  color: {
    primary: string
    accent: string
  }
  font: string
}

export interface Organization {
  id: string
  name: string
  address: string
  foundedYear: number
  branding: OrganizationBranding
  website?: string
  phone?: string
  whatsapp?: string
  socials?: {
    instagram?: string
    facebook?: string
    youtube?: string
  }
  invites: string[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string | undefined
}

export interface ProjectClient {
  name: string
  avatar?: string
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
export const resourceTypes = ['organization', 'user', 'contact', 'project', 'document', 'stream', 'media'] as const

export type ResourceType = (typeof resourceTypes)[number]

export type NotionDB = { [K in ResourceType]: string }

export interface ResourceRecordMap {
  organization: NotionOrganization
  user: NotionUser
  contact: NotionContact
  project: NotionProject
  document: NotionDocument
  stream: NotionStream
  media: NotionMedia
  terms: string
  privacy: string
  cancellation: string
  license: string
}

export interface Resource<T extends ResourceType = ResourceType> {
  type: T
  notificationStatus: boolean
  record: ResourceRecordMap[T]
}

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

export interface NotionOrganization {
  id: string
  created_time: string
  last_edited_time: string
  cover: NotionImage
  icon: NotionImage
  properties: {
    Name: {
      type: 'title'
      title: { plain_text: string }[]
    }
    Id: {
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
    'Account Details': {
      type: 'rich_text'
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
    Phone: {
      type: 'phone_number'
      phone_number: string
    }
    Whatsapp: {
      type: 'url'
      url: string
    }
    Website: {
      type: 'url'
      url: string
    }
    Branding: {
      type: 'rich_text'
      rich_text: {
        text: {
          content: string
        }
      }[]
    }
    'Founded Year': {
      type: 'number'
      number: number
    }
  }
}

export interface NotionUser {
  id: string
  created_time: string
  last_edited_time: string
  cover: NotionImage
  icon: NotionImage
  properties: {
    Name: {
      type: 'title'
      title: { plain_text: string }[]
    }
    Organization: {
      type: 'relation'
      relation: { id: string }[]
    }
    Role: {
      type: 'select'
      select: {
        name: 'Admin' | 'Editor' | 'Viewer'
      }
    }
    Status: {
      type: 'status'
      status: {
        name: 'Unfilled' | 'Filled' | 'Verified' | 'Active' | 'Inactive'
      }
    }
    Gender: {
      type: 'select'
      select: {
        name: 'Male' | 'Female' | 'Other'
      }
    }
    DOB: {
      type: 'date'
      date: {
        start: string
      }
    }
    Email: {
      type: 'email'
      email: string
    }
    Phone: {
      type: 'phone_number'
      phone_number: string
    }
    Emails: {
      type: 'relation'
      relation: { id: string }[]
    }
  }
}

export interface NotionContact {
  id: string
  created_time: string
  last_edited_time: string
  cover: NotionImage | null
  icon: NotionImage | null
  url: string
  properties: {
    Name: {
      type: 'title'
      title: { plain_text: string; text: { content: string } }[]
    }
    Index: {
      type: 'number'
      number: number | null
    }
    Status: {
      type: 'select'
      select: { name: 'Researched' | 'Active' | 'Inactive' | 'External Contact' | string } | null
    }
    Company: {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
    Type: {
      type: 'select'
      select: { name: string } | null
    }
    Address: {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
    Place: {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
    Email: {
      type: 'email'
      email: string | null
    }
    Whatsapp: {
      type: 'phone_number'
      phone_number: string | null
    }
    Phone: {
      type: 'phone_number'
      phone_number: string | null
    }
    Website: {
      type: 'url'
      url: string | null
    }
    Facebook: {
      type: 'url'
      url: string | null
    }
    Instagram: {
      type: 'url'
      url: string | null
    }
    Twitter: {
      type: 'url'
      url: string | null
    }
    LinkedIn: {
      type: 'url'
      url: string | null
    }
    'Platform Profile': {
      type: 'url'
      url: string | null
    }
    Username: {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
    Tags: {
      type: 'multi_select'
      multi_select: { name: string }[]
    }
    'PoC Person': {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
    'PoC Company': {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
    'PoC Address': {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
    'PoC Email': {
      type: 'email'
      email: string | null
    }
    'PoC Phone': {
      type: 'phone_number'
      phone_number: string | null
    }
    Project: {
      type: 'relation'
      relation: { id: string }[]
    }
    'Acquisition Date': {
      type: 'date'
      date: { start: string; end?: string | null } | null
    }
    Organization: {
      type: 'relation'
      relation: { id: string }[]
    }
    Emails: {
      type: 'relation'
      relation: { id: string }[]
    }
    Messages: {
      type: 'relation'
      relation: { id: string }[]
    }
    Calls: {
      type: 'relation'
      relation: { id: string }[]
    }
    'Last Active'?: {
      type: 'date'
      date: { start: string; end?: string | null } | null
    }
    'Last Message Snippet': {
      type: 'rich_text'
      rich_text: { plain_text: string; text: { content: string } }[]
    }
  }
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
        end: string
      }
    }
    Contact: {
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

export interface NotionDocument {
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
    Organization: {
      type: 'relation'
      relation: { id: string }[]
    }
  }
  url: string
  public_url: null
}

export interface NotionStream {
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
    Organization: {
      type: 'relation'
      relation: { id: string }[]
    }
  }
  url: string
  public_url: null
}

export interface NotionMedia {
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
    Organization: {
      type: 'relation'
      relation: { id: string }[]
    }
  }
}
