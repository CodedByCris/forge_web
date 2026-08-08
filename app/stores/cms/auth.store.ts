import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'Usuario no encontrado.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/invalid-email': 'Email no válido.',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde.',
  'auth/invalid-credential': 'Credenciales incorrectas.',
}

function mapFirebaseError(code: string): string {
  return FIREBASE_ERROR_MESSAGES[code] ?? 'Error al iniciar sesión.'
}

export const useCmsAuthStore = defineStore('cmsAuth', () => {
  const user = ref<User | null>(null)
  const isAdmin = ref(false)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null && isAdmin.value)

  async function checkAdminStatus(uid: string): Promise<boolean> {
    const db = getFirestore()
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) return false
    const data = userDoc.data() as { isAdmin?: boolean }
    return data.isAdmin === true
  }

  async function applyAuthResult(firebaseUser: User | null): Promise<void> {
    if (!firebaseUser) {
      user.value = null
      isAdmin.value = false
      return
    }

    const adminStatus = await checkAdminStatus(firebaseUser.uid)
    if (adminStatus) {
      user.value = firebaseUser
      isAdmin.value = true
    } else {
      await signOut(getAuth())
      user.value = null
      isAdmin.value = false
    }
  }

  function waitForAuth(): Promise<void> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
        try {
          await applyAuthResult(firebaseUser)
        } catch {
          user.value = null
          isAdmin.value = false
        }
        initialized.value = true
        unsubscribe()
        resolve()
      })
    })
  }

  function init(): void {
    onAuthStateChanged(getAuth(), async (firebaseUser) => {
      try {
        await applyAuthResult(firebaseUser)
      } catch {
        user.value = null
        isAdmin.value = false
      }
      initialized.value = true
    })
  }

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const credential = await signInWithEmailAndPassword(getAuth(), email, password)

      try {
        const adminStatus = await checkAdminStatus(credential.user.uid)

        if (!adminStatus) {
          await signOut(getAuth())
          error.value = 'Acceso restringido a administradores.'
          return false
        }

        user.value = credential.user
        isAdmin.value = true
        return true
      } catch (e) {
        try {
          await signOut(getAuth())
        } catch {
          // ignore secondary signOut failure, we still want to report the original error
        }
        error.value = e instanceof FirebaseError ? mapFirebaseError(e.code) : 'Error al iniciar sesión.'
        return false
      }
    } catch (e) {
      error.value = e instanceof FirebaseError ? mapFirebaseError(e.code) : 'Error al iniciar sesión.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    await signOut(getAuth())
    user.value = null
    isAdmin.value = false
  }

  return {
    user,
    isAdmin,
    initialized,
    loading,
    error,
    isAuthenticated,
    init,
    login,
    logout,
    waitForAuth,
  }
})
