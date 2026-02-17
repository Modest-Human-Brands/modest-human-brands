import * as z from 'zod'

/* Email Schema */
export const emailFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().optional(),
})

/* Organization Schema */
export const organizationFormSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear(), 'Enter a valid year'),
  invites: z.array(z.email('Invalid email address')).default([]),
})

/* User Schema */
export const userFormSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  dob: z.string().min(1, 'Please provide date of birth'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z
    .string()
    .min(10, 'Enter valid phone number')
    .regex(/^\+?\d{10,15}$/, 'Invalid phone number format'),
  organizationId: z.string().min(1, 'Please select an organization'),
})

/* Complete Form Schema with Conditional Organization */
export const completeUserFormSchema = z
  .object({
    name: z.string().min(2, 'Please enter your full name'),
    dob: z.string().min(1, 'Please provide date of birth'),
    gender: z.enum(['male', 'female', 'other']),
    phone: z
      .string()
      .min(10, 'Enter valid phone number')
      .regex(/^\+?\d{10,15}$/, 'Invalid phone number'),
    organizationId: z.string().min(1, 'Please select an organization'),
    organization: organizationFormSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.organizationId === 'create-new') {
        return !!data.organization
      }
      return true
    },
    {
      message: 'Organization details are required when creating a new organization',
      path: ['organization'],
    }
  )

/* Types */
export type EmailFormData = z.infer<typeof emailFormSchema>
export type UserFormData = z.infer<typeof userFormSchema>
export type OrganizationFormData = z.infer<typeof organizationFormSchema>
export type CompleteUserFormData = z.infer<typeof completeUserFormSchema>

// Export Organization type for auth.d.ts
export type Organization = {
  id: string
  name: string
  foundedYear: number
  invites: string[]
  ownerId?: string
  memberCount?: number
  createdAt?: string
  updatedAt?: string
}
