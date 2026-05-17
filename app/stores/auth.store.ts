import { defineStore } from 'pinia'
import { authService } from '~/services/auth.service'
import { profileService } from '~/services/profile.service'
import type { AuthUser } from '~/types/auth'
import type { UserProfile } from '~/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)

  async function signIn(email: string, password: string): Promise<void> {
    const firebaseUser = await authService.signIn(email, password)
    user.value = { id: firebaseUser.uid, email: firebaseUser.email! }
    profile.value = await profileService.fetchProfile(firebaseUser.uid)
  }

  async function signOut(): Promise<void> {
    await authService.signOut()
    user.value = null
    profile.value = null
  }

  function init(): Promise<void> {
    return new Promise<void>((resolve) => {
      const unsub = authService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          user.value = { id: firebaseUser.uid, email: firebaseUser.email! }
          profile.value = await profileService.fetchProfile(firebaseUser.uid)
        } else {
          user.value = null
          profile.value = null
        }
        loading.value = false
        resolve()
        unsub()
      })
    })
  }

  return { user, profile, loading, signIn, signOut, init }
})
