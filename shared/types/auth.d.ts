declare module '#auth-utils' {
  interface UserOrganization {
    orgId: string
    orgName: string
    orgLogo?: string
  }

  interface User {
    id: string
    name: string
    avatar?: string
    email: string
    organizations: UserOrganization[]
    createdAt: string
    updatedAt: string
    isProfileComplete: boolean
  }

  interface UserSession {
    loggedInAt: string
    deviceId?: string
  }

  /* interface SecureSessionData {
    // Add your own fields
  } */
}

export {}
