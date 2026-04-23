export default defineEventHandler(() => {
  try {
    const config = useRuntimeConfig().app
    // com.docker.compose.service || com.docker.swarm.task.name
    const node = import.meta.env.HOSTNAME || 'unknown-node'

    return { status: 'OK', ...config, node }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API health GET', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
