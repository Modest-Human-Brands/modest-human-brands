export interface MDocDocument {
  id: string
  templateId: string
  name: string
  mimeType: string
  sizeBytes: number
  status: string
  projectId: string | null
  organizationId: string | null
  categories: string[]
  previewUrl: string
  createdAt: string
  updatedAt: string
  extension?: string
  formattedSize?: string
  timeline?: {
    id: string
    date: string
    time: string
    userInitials: string
    userName: string
    action: string
  }[]
}

export default defineEventHandler(async (event) => {
  const docId = getRouterParam(event, 'docId')

  if (!docId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing document ID' })
  }

  const config = useRuntimeConfig()

  try {
    const doc = await $fetch<MDocDocument>(`/api/document/${docId}`, {
      baseURL: config.public.docUrl,
    })

    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'application/msword': 'doc',
      'application/vnd.ms-excel': 'xls',
    }
    const extension = mimeToExt[doc.mimeType] || doc.mimeType.split('/').pop()?.toLowerCase() || 'file'

    const formattedSize = formatBytes(doc.sizeBytes)

    const timeline = [
      { id: 't1', date: '31 Jan, 2021', time: '6:36 pm', userInitials: 'J', userName: 'Person 1', action: 'sent the document' },
      { id: 't2', date: '31 Jan, 2021', time: '6:36 pm', userInitials: 'J', userName: 'Person 1', action: "add comment 'What does the line 22 means'" },
      { id: 't3', date: '31 Jan, 2021', time: '6:36 pm', userInitials: 'J', userName: 'Person 1', action: "add comment 'What does the line 22 means'" },
      { id: 't4', date: '31 Jan, 2021', time: '6:36 pm', userInitials: 'J', userName: 'Person 1', action: "add comment 'What does the line 22 means'" },
      { id: 't5', date: '31 Jan, 2021', time: '6:36 pm', userInitials: 'J', userName: 'Person 1', action: "add comment 'What does the line 22 means'" },
    ]

    return { ...doc, extension, formattedSize, timeline }
  } catch (error) {
    console.error(`MDoc Single Fetch Error [ID: ${docId}]:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch document metadata',
    })
  }
})
