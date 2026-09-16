export interface CreateSignerSessionParams {
  projectSlug?: string
  docId: string
  signerEmail: string
  signerName: string
  signerIsContact: boolean
}

interface SessionResponse {
  signer: string
  expiresAt: string
  sessionToken: string
}

export default async function createSignerSession({ projectSlug, docId, signerEmail, signerName, signerIsContact }: CreateSignerSessionParams): Promise<SessionResponse & { magicLink: string }> {
  const config = useRuntimeConfig()

  const document = await $fetch<MDocDocument>(`/api/document/${docId}`, {
    baseURL: config.public.docUrl,
  })

  const sessionRes = await $fetch<SessionResponse>(`/api/document/${docId}/session`, {
    baseURL: config.public.docUrl,
    method: 'POST',
    body: { signerEmail, expiresIn: document.rawData?.expiresIn },
  })

  const magicLink = `${config.public.siteUrl}/doc/${projectSlug}/envelope/${docId}?token=${sessionRes.sessionToken}`

  try {
    await $fetch('/api/interaction/email/send', {
      baseURL: config.public.connectUrl,
      headers: { 'x-org-id': config.private.mhbOrgId },
      method: 'POST',
      body: {
        contactId: document.project?.contact?.id,
        recipientEmail: signerEmail,
        template: document.templateId,
        variables: {
          ...document.rawData,
          recipient: {
            name: signerName,
            isContact: signerIsContact,
            isSigned: false,
          },
          link: magicLink,
        },
        orgId: document.organizationId,
        projectId: document.projectId,
      },
    })
  } catch (error) {
    console.warn('Automated MConnect Email Dispatch Failed:', error)
  }

  return { ...sessionRes, magicLink }
}

export async function advanceSequentialSigner(docId: string): Promise<void> {
  try {
    const config = useRuntimeConfig()
    const document = await $fetch<MDocDocument>(`/api/document/${docId}`, {
      baseURL: config.public.docUrl,
    })
    const queue = (document.routingQueue || []).sort((a, b) => a.order - b.order)

    for (const signer of queue) {
      const predecessorSigned = queue.filter((s) => s.order < signer.order).every((s) => s.status === 'COMPLETED' || s.status === 'SIGNED')
      const isPending = signer.status !== 'COMPLETED' && signer.status !== 'SIGNED' && signer.status !== 'Void'
      if (isPending && predecessorSigned) {
        await createSignerSession({
          projectSlug: document.project.slug,
          docId,
          signerEmail: signer.email,
          signerName: signer.name,
          signerIsContact: false,
        })
        return
      }
    }
  } catch (error) {
    console.warn('advanceSequentialSigner failed:', error)
  }
}
