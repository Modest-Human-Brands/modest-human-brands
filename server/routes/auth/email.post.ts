import { findOrCreateNotionUser } from '~~/server/routes/auth/google.get'

export const mhbOrg = {
  id: 'modest-human-brands',
  name: 'Modest Human Brands',
  address: 'Abc Road, Near DEF, UIO - 1890',
  website: 'https://modesthumanbrands.com',
  branding: {
    logo: 'https://modesthumanbrands.com/logo.svg',
    color: { primary: '#2B2B2B', accent: '#4A85FF' },
    font: 'Exo2',
  },
}

export type EmailTemplateData = {
  otp: { otp: string } & ({ toEmail: string; contactId?: never } | { contactId: string; toEmail?: never })
}

export async function sendEmail<T extends keyof EmailTemplateData>(template: T, payload: EmailTemplateData[T][]) {
  let isSuccessful = true

  await Promise.allSettled(
    payload.map(async (payloadData) => {
      try {
        await $fetch('/api/connect/text/email/send', {
          baseURL: 'http://localhost:3001',
          method: 'POST',
          body: {
            recipientEmail: payloadData.toEmail,
            template: 'otp',
            variables: {
              recipientEmail: payloadData.toEmail,
              otpCode: payloadData.otp,
              expiresIn: '5 minutes',
              organization: mhbOrg,
            },
          },
        })
      } catch (error) {
        console.error('function sendEmail', error)
        isSuccessful = false
      }
    })
  )

  return isSuccessful
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email: string; otp?: string }>(event)
    const authCodeStorage = useStorage<{ type: 'email' | 'phone'; code: string; expiresAt: number }>(`data:auth:code`)

    let isSuccess = false
    let navigateTo: string | undefined = undefined

    if (!body.otp) {
      const code = generateCode(8, 'alphanumeric')
      isSuccess = await sendEmail('otp', [{ otp: code, toEmail: body.email }])
      await authCodeStorage.setItem(body.email, { type: 'email', code, expiresAt: Date.now() + 5 * 60 * 1000 })
    } else {
      const authData = await authCodeStorage.getItem(body.email)

      if (!authData) throw createError({ statusCode: 400, statusMessage: "OTP isn't generated" })
      else if (authData.expiresAt <= Date.now()) {
        throw createError({ statusCode: 400, statusMessage: 'OTP Expired' })
      } else if (authData.code !== body.otp) throw createError({ statusCode: 400, statusMessage: 'OTP Mismatched' })
      else {
        isSuccess = true
        const user = await findOrCreateNotionUser({ email: body.email })

        await setUserSession(
          event,
          {
            user: {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              email: user.email,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              isProfileComplete: user.isProfileComplete,
              organizations: user.organizations,
            },
            loggedInAt: new Date().toISOString(),
          },
          { maxAge: 30 * 24 * 60 * 60 * 1000 }
        )

        navigateTo = user.isProfileComplete ? '/dashboard' : '/auth/signup'
      }
    }

    return { isSuccess, navigateTo }
  } catch (error: unknown) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    console.error('API auth/email POST', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Some Unknown Error Found',
    })
  }
})
