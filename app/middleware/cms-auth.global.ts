import { useCmsAuthStore } from '~/stores/cms/auth.store'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/cms' && !to.path.startsWith('/cms/')) return

  const authStore = useCmsAuthStore()

  if (!authStore.initialized) {
    await authStore.waitForAuth()
  }

  const isLoginPage = to.path === '/cms/login'

  if (!authStore.isAuthenticated && !isLoginPage) {
    return navigateTo('/cms/login')
  }

  if (authStore.isAuthenticated && isLoginPage) {
    return navigateTo('/cms')
  }
})
