import { findOrCreateNotionUser } from '~~/server/routes/auth/google.get'

// HARD CODED MBH ORG
export const mhbOrg = {
  id: 'modest-human-brands',
  name: 'Modest Human Brands',
  legalName: 'Modest Human Brands LLP',
  entityType: 'LLP',
  tradeRelationship: 'Primary',
  gstin: undefined,
  pan: 'ABCDE0123F',
  address: '17 NO, N S Road,harinavi Beltola, South 24 Parganas, West Bengal, India',
  foundedYear: 2025,
  accountDetails: {
    accountName: 'Modest Human Brands LLP',
    accountNumber: 1_234_567_890,
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
  },
  website: 'https://modesthumanbrands.com',
  contactEmail: 'contact@modesthumanbrands.com',
  billingEmail: 'billing@modesthumanbrands.com',
  primaryContactId: 'contact-1',
  organizationMemberIds: ['member-1'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  branding: {
    logo: 'https://modesthumanbrands.com/logo.svg',
    color: {
      primary: '#111827',
      accent: '#5945EA',
    },
    font: 'Exo2',
  },
  phone: '+919999999999',
  whatsapp: '+919999999999',
  socials: {
    instagram: 'https://www.instagram.com/modesthumanbrands/',
    facebook: 'https://facebook.com/modesthumanbrands',
    linkedin: 'https://linkedin.com/company/modest-human-brands',
    youtube: 'https://www.youtube.com/@modesthumanbrands',
  },
}

export type EmailTemplateData = {
  otp: { otp: string } & ({ toEmail: string; contactId?: never } | { contactId: string; toEmail?: never })
}

export async function sendEmail<T extends keyof EmailTemplateData>(template: T, payload: EmailTemplateData[T][]) {
  let isSuccessful = true

  const config = useRuntimeConfig()

  await Promise.allSettled(
    payload.map(async (payloadData) => {
      try {
        await $fetch('/api/interaction/email/send', {
          baseURL: config.public.connectUrl,
          method: 'POST',
          body: {
            recipientEmail: payloadData.toEmail,
            template: 'otp',
            orgId: 'modest-human-brands',
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
