export async function useCacheAsset({ name }: { name: string }) {
  const cache = ref<Cache>()

  async function init() {
    cache.value = await window.caches.open(name)
  }

  onMounted(() => {
    init()
  })

  async function set(request: RequestInfo | URL, response: Response) {
    await cache.value!.put(request, response)
  }

  async function get(request: RequestInfo | URL) {
    return await cache.value!.match(request)
  }

  async function remove() {
    return await cache.value!.delete(name)
  }

  return { set, get, remove }
}
