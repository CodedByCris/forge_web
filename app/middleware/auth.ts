export default defineNuxtRouteMiddleware((to) => {
  const { user, loading } = useAuthStore()

  // Safety net — init() resolves before this runs via plugin
  if (loading) return

  const isAuthRoute = to.path.startsWith('/train/auth')

  if (!user && !isAuthRoute) {
    return navigateTo('/train/auth/login')
  }
  if (user && isAuthRoute) {
    return navigateTo('/train')
  }
})
