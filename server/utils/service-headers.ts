type Service = 'doc' | 'drive' | 'connect' | 'media' | 'wap'

/** Headers for a call to a microservice: its shared secret as `x-api-key`, plus any extras. */
export function serviceHeaders(service: Service, extra: Record<string, string | undefined> = {}): Record<string, string> {
  const config = useRuntimeConfig()
  const apiKey = config.private[`${service}ApiKey`]

  return Object.fromEntries(Object.entries({ ...(apiKey ? { 'x-api-key': apiKey } : {}), ...extra }).filter((entry): entry is [string, string] => !!entry[1]))
}
