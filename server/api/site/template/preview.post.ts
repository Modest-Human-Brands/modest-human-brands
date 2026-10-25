export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody(event)

  return wapFetch<{ html: string; page: string }>('/api/site/template/preview', { method: 'POST', body })
})
