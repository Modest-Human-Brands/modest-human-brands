export default defineMcpTool({
  name: 'health',
  description: 'Get health, version, buildtime, and node',
  handler: () => {
    const config = useRuntimeConfig().meta
    // com.docker.compose.service || com.docker.swarm.task.name
    const node = import.meta.env.HOSTNAME || 'unknown-node'

    return {
      status: 'OK',
      ...config,
      node,
    }
  },
})
