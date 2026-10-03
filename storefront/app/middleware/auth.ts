export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    const localePath = useLocalePath()
    return navigateTo({ path: localePath('/'), query: { returnTo: to.fullPath } })
  }
})
