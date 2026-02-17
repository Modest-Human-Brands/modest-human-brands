declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    avatar?: string
    email: string
    organizations: string[]
    createdAt: string
    updatedAt: string
    isProfileComplete: boolean
  }

  interface UserSession {
    loggedInAt: string
  }

  /* interface SecureSessionData {
    // Add your own fields
  } */
}

export {}
