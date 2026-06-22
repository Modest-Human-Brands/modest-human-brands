export function formatKeyToLabel(key: string): string {
  if (!key) return ''

  const cleanKey = key.split('-').pop() || key
  const spaced = cleanKey.replace(/([A-Z])/g, ' $1').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function unflattenPayload(flatData: Record<string, unknown>) {
  const result: Record<string, unknown> = {}
  for (const [path, value] of Object.entries(flatData)) {
    const keys = path.split('.')
    let current = result
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = Array.isArray(value) ? value.filter((v: unknown) => String(v).trim() !== '') : value
      } else {
        current[key] = (current[key] || {}) as Record<string, unknown>
        current = current[key] as Record<string, unknown>
      }
    })
  }
  return result
}
