export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  try { auth.setCustomer(await useNuxtApp().$services.auth.getActiveCustomer()) }
  catch { auth.setCustomer(null) }
  if (!auth.isAuthenticated) {
    const localePath = useLocalePath()
    return navigateTo({ path: localePath('/account'), query: { returnTo: to.fullPath } })
  }
})
