export interface LayoutAction {
  name: 'create' | 'filter' | 'refresh' | 'export' | string
  payload?: { type: string; source: string }
  timestamp: number
}

export const useLayoutActions = () => {
  const route = useRoute()

  const state = useState<LayoutAction>('layout-bus', () => ({
    name: '',
    payload: undefined,
    timestamp: 0,
  }))

  /**
   * Evaluates the current base route from the URL segments
   */
  const currentBaseRoute = computed(() => {
    const segments = route.path.split('/').filter(Boolean)
    return segments.length > 0 ? segments[0] : null
  })

  const emitAction = async (name: string, payload?: { type: string; source: string }) => {
    state.value = {
      name,
      payload,
      timestamp: Date.now(),
    }

    // Navigation logic for 'create' action
    if (name === 'create') {
      const targetBase = currentBaseRoute.value || payload?.type

      if (targetBase) {
        await navigateTo(`/${targetBase}/new`)
      }
    }
  }

  return {
    state: readonly(state),
    emitAction,
    currentBaseRoute,
  }
}
