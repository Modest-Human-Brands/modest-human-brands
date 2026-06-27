import { z } from 'zod'

const deviceSchema = z.object({ deviceId: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { deviceId } = await readValidatedBody(event, deviceSchema.parse)

  if (session.deviceId === deviceId) {
    return { success: true, updated: false }
  }

  await replaceUserSession(
    event,
    {
      user: session.user,
      loggedInAt: session.loggedInAt,
      deviceId: deviceId,
    },
    { maxAge: 30 * 24 * 60 * 60 * 1000 }
  )

  return { success: true, updated: true }
})
