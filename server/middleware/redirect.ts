const defaultSubpaths: Record<string, string> = {
  project: 'plan',
  // organization: 'dashboard',
}

export default defineEventHandler((event) => {
  const pathname = event.path

  const match = pathname.match(/^\/([^/]+)\/([^/]+)\/?$/)
  if (!match) {
    return
  }

  const [, resource, rawIdOrSlug] = match
  const idOrSlug = decodeURIComponent(rawIdOrSlug)

  const query = getRequestURL(event).search

  if (defaultSubpaths[resource]) {
    const subpath = defaultSubpaths[resource]
    return sendRedirect(event, `/${resource}/${idOrSlug}/${subpath}${query}`, 301)
  }
})
