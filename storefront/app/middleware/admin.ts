export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Forbidden' }))
  }
})
