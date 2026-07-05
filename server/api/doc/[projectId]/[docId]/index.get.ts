export interface MDocDocument {
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
  rawData: Record<string, string>
  verificationData?: {
    isIntact: boolean
    signer: string
    message: string
  } | null
}

export default defineEventHandler(async (event) => {
  // const { user } =
  // await requireUserSession(event)

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

    let verificationData = null
    if (doc.status === 'Completed') {
      try {
        const pdfBlob = await $fetch<Blob>(`/api/document/${docId}/content?download`, { baseURL: config.public.docUrl })
        const formData = new FormData()
        formData.append('pdf', pdfBlob, doc.name)

        verificationData = await $fetch<{ isIntact: boolean; signer: string; message: string }>(`/api/document/${docId}/verify-signature`, {
          baseURL: config.public.docUrl,
          method: 'POST',
          body: formData,
        })
      } catch (err) {
        console.error('Signature verification failed:', err)
        verificationData = { isIntact: false, signer: 'Unknown', message: 'Could not verify signature mathematically.' }
      }
    }

    return { ...doc, extension, formattedSize, timeline: [], verificationData }
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
