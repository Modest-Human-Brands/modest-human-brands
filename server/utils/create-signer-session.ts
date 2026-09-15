export interface CreateSignerSessionParams {
  projectId: string
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

/**
 * Creates a signing session for a single signer: builds the magic link and
 * dispatches the email, then resolves the session token. Email dispatch is
 * fire-and-forget — a failure is logged but never blocks session creation, so a
 * signer can always open the link even if the email bounces.
 */
export async function createSignerSession({ projectId, docId, signerEmail, signerName, signerIsContact }: CreateSignerSessionParams): Promise<SessionResponse & { magicLink: string }> {
  const config = useRuntimeConfig()

  const document = await $fetch<MDocDocument>(`/api/document/${docId}`, {
    baseURL: config.public.docUrl,
  })

  const sessionRes = await $fetch<SessionResponse>(`/api/document/${docId}/session`, {
    baseURL: config.public.docUrl,
    method: 'POST',
    body: { signerEmail, expiresIn: document.rawData?.expiresIn },
  })

  const magicLink = `${config.public.siteUrl}/doc/${projectId}/envelope/${docId}?token=${sessionRes.sessionToken}`

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

/**
 * Triggered right after a signer completes their signature (in the sign
 * endpoints). Re-reads the sequential routing queue and hands a session to the
 * next due signer — the lowest-order signer that is still pending and whose
 * every predecessor has already signed. Sequential routing is driven by the
 * external service, so there is no "advance" endpoint to call; this is what
 * turns the external state change into a new magic link + email.
 */
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
          projectId: document.project?.id || '',
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
