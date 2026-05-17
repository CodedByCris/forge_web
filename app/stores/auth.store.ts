import { defineStore } from 'pinia'
import { authService } from '~/services/auth.service'
import { profileService, type ProfileUpdateParams } from '~/services/profile.service'
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

  async function updateProfile(params: ProfileUpdateParams): Promise<void> {
    if (!user.value) return
    await profileService.updateProfile(user.value.id, params)
    // Refresh local profile
    profile.value = await profileService.fetchProfile(user.value.id)
  }

  return { user, profile, loading, signIn, signOut, init, updateProfile }
})
