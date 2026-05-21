# Feature: Auth

## Qué hace

Login, registro y logout con Firebase Auth (email + password). Guarda sesión persistente (Firebase lo maneja nativamente). El registro crea la cuenta en Firebase Auth y el doc `users/{uid}` en Firestore con los mismos campos que usa la app Flutter.

## Rutas

- `GET /train/auth/login` — página de login
- `GET /train/auth/register` — wizard de registro (3 pasos)
- Redirect a `/train` tras login/registro exitoso
- Redirect a `/train/auth/login` si no hay sesión (middleware)

---

## Archivos

```
services/auth.service.ts          ← signIn, signOut, onAuthStateChanged, createUser
services/profile.service.ts       ← fetchProfile, checkNicknameAvailable, createProfile
stores/auth.store.ts
pages/train/auth/login.vue        ← link a /train/auth/register añadido
pages/train/auth/register.vue     ← wizard 3 pasos
components/auth/RegisterStep1.vue ← email + contraseña
components/auth/RegisterStep2.vue ← nickname (check unicidad) + objetivo
components/auth/RegisterStep3.vue ← éxito + descarga app + ir al dashboard
middleware/auth.ts
plugins/firebase.client.ts
```

---

## Servicio Firebase

```typescript
// services/auth.service.ts
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const auth = getAuth()
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  },

  async signOut(): Promise<void> {
    await signOut(getAuth())
  },

  onAuthStateChanged(cb: (user: User | null) => void): () => void {
    return onAuthStateChanged(getAuth(), cb)
  },

  get currentUser(): User | null {
    return getAuth().currentUser
  }
}
```

---

## Store (Pinia)

```typescript
// stores/auth.store.ts
import { defineStore } from 'pinia'
import { authService } from '~/services/auth.service'
import { profileService } from '~/services/profile.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)

  async function signIn(email: string, password: string) {
    const firebaseUser = await authService.signIn(email, password)
    user.value = { id: firebaseUser.uid, email: firebaseUser.email! }
  }

  async function signOut() {
    await authService.signOut()
    user.value = null
    profile.value = null
  }

  function init() {
    return new Promise<void>((resolve) => {
      const unsub = authService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          user.value = { id: firebaseUser.uid, email: firebaseUser.email! }
          // Cargar perfil en paralelo
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
```

---

## Middleware

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { user, loading } = useAuthStore()

  // Durante init no redirigir
  if (loading) return

  const isAuthRoute = to.path.startsWith('/train/auth')
  if (!user && !isAuthRoute) {
    return navigateTo('/train/auth/login')
  }
  if (user && isAuthRoute) {
    return navigateTo('/train')
  }
})
```

---

## Plugin init

```typescript
// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.init()
})
```

---

## UI — Login Page

**`pages/train/auth/login.vue`**

### Layout

```
┌────────────────────────────┐
│         Logo / Icon        │
│    "GymApp" o brand name   │
│                            │
│   ┌────────────────────┐   │
│   │ Email              │   │
│   └────────────────────┘   │
│   ┌────────────────────┐   │
│   │ Password      👁️   │   │
│   └────────────────────┘   │
│                            │
│   [  Iniciar sesión  ]     │
│                            │
│   Error message (si hay)   │
└────────────────────────────┘
```

### Comportamiento

- Botón deshabilitado mientras `loading`
- Spinner en botón durante submit
- Error específico según código Firebase:
  - `auth/user-not-found` → "Usuario no encontrado"
  - `auth/wrong-password` → "Contraseña incorrecta"
  - `auth/too-many-requests` → "Demasiados intentos. Espera unos minutos"
  - Resto → "Error al iniciar sesión"
- Toggle mostrar/ocultar contraseña
- Enter en password = submit

### Validación

- Email: requerido + formato válido
- Password: requerido + mínimo 6 caracteres
- Validación en submit (no inline)

---

## Errores Firebase → mensajes

| Código | Mensaje (ES) | Mensaje (EN) |
|--------|-------------|--------------|
| `auth/user-not-found` | Usuario no encontrado | User not found |
| `auth/wrong-password` | Contraseña incorrecta | Wrong password |
| `auth/invalid-email` | Email inválido | Invalid email |
| `auth/too-many-requests` | Demasiados intentos | Too many attempts |
| `auth/network-request-failed` | Sin conexión | No connection |
| Resto | Error al iniciar sesión | Sign in failed |

---

## Decisiones técnicas

- **Login y registro** — el registro crea cuenta en Firebase Auth + doc `users/{uid}` en Firestore con los mismos campos que la app Flutter (username, email, coins, totalXp, purchasedItems, etc.)
- Validación de nickname único: `checkNicknameAvailable()` hace query Firestore antes de crear la cuenta
- Firebase Auth maneja la persistencia de sesión (`LOCAL` por defecto)
- El token se renueva automáticamente
- `onAuthStateChanged` en plugin → resuelve antes de primer render
- No guardar credenciales en Pinia/localStorage — Firebase maneja todo
- Las rutas `/` y `/pricing` son públicas — el middleware `auth.ts` las excluye explícitamente
