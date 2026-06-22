import type { MDocDocument } from './index.get'

export default defineEventHandler(async (event) => {
  try {
    const docId = getRouterParam(event, 'docId')
    const body = await readBody<{ signerEmail: string; expiresInMinutes: number }>(event)
    const config = useRuntimeConfig()

    const sessionRes = await $fetch<{
      signer: string
      expiresAt: string
      token: string
      magicLink: string
    }>(`/api/document/${docId}/session`, {
      baseURL: config.public.docUrl,
      method: 'POST',
      body: body || {},
    })

    const docDetails = await $fetch<MDocDocument>(`/api/document/${docId}`, {
      baseURL: config.public.docUrl,
    })

    // console.log({
    //   data: {
    //     ...docDetails.rawData,
    //     link: sessionRes.magicLink,
    //   },
    // })

    console.log({
      // userId,
      contactId: docDetails.project?.contact?.id,
      recipientEmail: body.signerEmail,
      template: docDetails.templateId,
      variables: {
        ...docDetails.rawData,
        link: sessionRes.magicLink,
      },
      orgId: docDetails.organizationId,
      projectId: docDetails.projectId,
    })
    try {
      await $fetch('/api/connect/text/email/send', {
        baseURL: config.public.connectUrl,
        method: 'POST',
        body: {
          // userId,
          contactId: docDetails.project?.contact?.id,
          recipientEmail: body.signerEmail,
          template: docDetails.templateId,
          variables: {
            ...docDetails.rawData,
            link: sessionRes.magicLink,
          },
          orgId: docDetails.organizationId,
          projectId: docDetails.projectId,
        },
      })
    } catch (emailError) {
      console.error('Automated MConnect Email Dispatch Failed:', emailError)
    }

    return sessionRes
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
