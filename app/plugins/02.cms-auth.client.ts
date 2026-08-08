import { useCmsAuthStore } from '~/stores/cms/auth.store'

export default defineNuxtPlugin(() => {
  const authStore = useCmsAuthStore()
  authStore.init()
})
