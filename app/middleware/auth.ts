import { defineNuxtRouteMiddleware } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/signin')
  }

  if (to.path !== '/dashboard') {
    return navigateTo('/dashboard')
  }
})
