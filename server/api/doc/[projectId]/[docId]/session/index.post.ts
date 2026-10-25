export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event)

    const projectId = getRouterParam(event, 'projectId')
    const docId = getRouterParam(event, 'docId')

    if (!projectId || !docId) {
      throw createError({ statusCode: 400, statusMessage: 'projectId and docId are strictly required' })
    }

    await assertDocInOrg(docId, getActiveOrgId(event, user))

    const { signerName, signerEmail, signerIsContact } = await readBody<{ signerName: string; signerEmail: string; signerIsContact: boolean }>(event)

    const result = await createSignerSession({
      projectSlug: projectId,
      docId,
      signerEmail,
      signerName,
      signerIsContact,
    })

    return result
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
