export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.init()
})
