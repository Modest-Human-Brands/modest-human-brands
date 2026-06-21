interface MDocDocument {
  id: string
  templateId: string
  name: string
  mimeType: string
  sizeBytes: number
  status: string
  projectId: string | null
  project: {
    id: string
    name: string
    contact: {
      id: string
      name: string
      email: string
    }
  } | null
  organizationId: string | null
  categories: string[]
  previewUrl: string
  createdAt: string
  updatedAt: string
  routingType?: string
  nextSigner?: string
  routingQueue?: {
    order: number
    name: string
    email: string
    role: string
    status: string
  }[]
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
  // const { user } =
  await requireUserSession(event)

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

    return { ...doc, extension, formattedSize, timeline: [] }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error(`API doc/[projectId]/[docId] POST`, error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
