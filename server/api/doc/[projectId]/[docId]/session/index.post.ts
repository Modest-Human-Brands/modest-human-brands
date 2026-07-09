import type { MDocDocument } from '../index.get'

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, 'projectId')
    const docId = getRouterParam(event, 'docId')

    const { signerName, signerEmail, signerIsContact } = await readBody<{ signerName: string; signerEmail: string; signerIsContact: boolean }>(event)
    const config = useRuntimeConfig()

    const docDetails = await $fetch<MDocDocument>(`/api/document/${docId}`, {
      baseURL: config.public.docUrl,
    })

    const sessionRes = await $fetch<{
      signer: string
      expiresAt: string
      sessionToken: string
    }>(`/api/document/${docId}/session`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: { signerEmail, expiresIn: docDetails.rawData?.expiresIn },
    })
    const magicLink = `${config.public.siteUrl}/doc/${projectId}/envelope/${docId}?token=${sessionRes.sessionToken}`

    try {
      await $fetch('/api/connect/text/email/send', {
        baseURL: config.public.connectUrl,
        method: 'POST',
        body: {
          contactId: docDetails.project?.contact?.id,
          recipientEmail: signerEmail,
          template: docDetails.templateId,
          variables: {
            ...docDetails.rawData,
            recipient: {
              name: signerName,
              isContact: signerIsContact,
              isSigned: false,
            },
            link: magicLink,
          },
          orgId: docDetails.organizationId,
          projectId: docDetails.projectId,
        },
      })
    } catch (error) {
      console.warn('Automated MConnect Email Dispatch Failed:', error)
    }

    return {
      ...sessionRes,
      magicLink,
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error(`API /doc/[projectId]/[docId]/session POST`, error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
