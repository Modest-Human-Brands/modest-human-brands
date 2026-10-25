interface MDocRawDocument {
  id: string
  templateId: string
  name: string
  mimeType: string
  sizeBytes: number
  status: string
  organizationId: string | null
  project: { id: string; slug?: string; name: string }
  contact: { id: string; name: string; email: string }[]
  user: { id: string; name: string; email: string }
  routingType?: string
  nextSigner?: string | null
  routingQueue?: { order: number; name: string; email: string; role: string; status: string }[]
  categories?: string[]
  previewUrl?: string
  createdAt?: string
  updatedAt?: string
  rawData?: unknown | null
}

interface MDocEnvelopeResponse {
  status: string
  nextSigner: string
  queueSize: number
}

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)
    const activeOrgId = getActiveOrgId(event, user)

    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { recipientId, templateData } = await retransformTemplate(event, { ...body, orgId: activeOrgId, templateId: body.template })

    const { number } = await $fetch<{ number: string }>('/api/document/numbering/next', {
      baseURL: config.public.docUrl,
      headers: serviceHeaders('doc', { 'x-org-id': await getOrgSlug(activeOrgId) }),
      query: { templateId: body.template },
    })

    body.name = number
    body.orgId = activeOrgId
    body.data = templateData
    body.userId = user.id
    body.contactId = recipientId

    const response = await $fetch<{ id: string; templateId: string; name: string; sizeBytes: number }>('/api/document/template', {
      baseURL: config.public.docUrl,
      headers: serviceHeaders('doc'),
      method: 'POST',
      body,
    })

    const document = await $fetch<MDocRawDocument>(`/api/document/${response.id}`, {
      baseURL: config.public.docUrl,
      headers: serviceHeaders('doc'),
    })

    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'application/msword': 'doc',
      'application/vnd.ms-excel': 'xls',
    }
    const extension = mimeToExt[document.mimeType] || document.mimeType.split('/').pop()?.toLowerCase() || 'file'
    const formattedSize = formatBytes(document.sizeBytes)

    const recipient = document.contact.map((c, i) => ({ order: i + 1, name: c.name || '', email: c.email || '', role: 'Client' }))

    const signers = [...recipient, { order: recipient.length + 1, name: document.user.name || '', email: document.user.email || '', role: 'Signer' }]

    const envelope = await $fetch<MDocEnvelopeResponse>(`/api/document/${response.id}/envelope`, {
      baseURL: config.public.docUrl,
      headers: serviceHeaders('doc'),
      method: 'POST',
      body: { expiresInDays: 7, routingType: 'SEQUENTIAL', signers },
    })

    notify(
      event,
      'DOCUMENT_CREATED',
      {
        documentId: response.id,
        templateId: response.templateId,
        fileName: response.name,
      },
      activeOrgId
    )

    await createSignerSession({
      projectSlug: document.project?.slug || '',
      docId: response.id,
      signerEmail: signers[0]!.email,
      signerName: signers[0]!.name,
      signerIsContact: true,
    })

    return {
      document: { ...document, extension, formattedSize, timeline: [] },
      envelope,
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API /doc/template POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
