# Feature: Settings

## Qué hace

Gestión de cuenta y preferencias: datos del perfil, privacidad, objetivo semanal, cambio de email/contraseña, cerrar sesión.

---

## Ruta

```
/train/settings               ← página principal settings
/train/settings/account       ← cambiar email, contraseña, eliminar cuenta
/train/settings/profile       ← editar nombre, foto, datos físicos
/train/settings/goals         ← objetivo semanal de entrenamientos
```

O todo en una sola página con secciones (más simple para MVP).

---

## Archivos

```
services/profile.service.ts
services/account.service.ts
stores/profile.store.ts
pages/train/settings/index.vue
components/settings/
  ProfileSection.vue
  AccountSection.vue
  GoalSection.vue
  PrivacySection.vue
  DangerZoneSection.vue
```

---

## Servicio Perfil

```typescript
// services/profile.service.ts
import {
  doc, getDoc, updateDoc, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { db } from '~/plugins/firebase.client'

export const profileService = {

  // Stream del perfil (tiempo real)
  watchProfile(userId: string, cb: (profile: UserProfile | null) => void): () => void {
    return onSnapshot(doc(db, 'users', userId), (snap) => {
      if (!snap.exists()) { cb(null); return }
      cb(mapProfile(snap))
    })
  },

  async fetchProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', userId))
    if (!snap.exists()) return null
    return mapProfile(snap)
  },

  async saveNickname(userId: string, nickname: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { nickname: nickname.trim() })
  },

  async saveDisplayName(userId: string, params: {
    firstName: string
    lastName: string
  }): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      firstName: params.firstName.trim() || null,
      lastName: params.lastName.trim() || null,
    })
  },

  async saveBodyMeasurements(userId: string, params: {
    heightCm: number | null
    weightKg: number | null
  }): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      heightCm: params.heightCm,
      weightKg: params.weightKg,
    })
  },

  async saveIsPrivate(userId: string, isPrivate: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { isPrivate })
  },

  async savePhotoUrl(userId: string, photoUrl: string | null): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { photoUrl })
  },
}

function mapProfile(snap: any): UserProfile {
  const d = snap.data()
  return {
    id: snap.id,
    email: d.email ?? '',
    nickname: d.nickname ?? '',
    photoUrl: d.photoUrl ?? null,
    firstName: d.firstName ?? null,
    lastName: d.lastName ?? null,
    heightCm: d.heightCm ?? null,
    weightKg: d.weightKg ?? null,
    configured: d.configured ?? false,
    buildType: d.buildType ?? null,
    activeTitle: d.activeTitle ?? null,
    isPrivate: d.isPrivate ?? false,
    followersCount: d.followersCount ?? 0,
    followingCount: d.followingCount ?? 0,
    totalXp: d.totalXp ?? 0,
    coins: d.coins ?? 0,
    lastXpDate: d.lastXpDate ?? null,
    purchasedItems: d.purchasedItems ?? [],
  }
}
```

---

## Servicio Cuenta (Auth operations sensibles)

```typescript
// services/account.service.ts
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
  deleteUser,
} from 'firebase/auth'

export const accountService = {

  async reauthenticate(currentPassword: string): Promise<void> {
    const auth = getAuth()
    const user = auth.currentUser!
    const cred = EmailAuthProvider.credential(user.email!, currentPassword)
    await reauthenticateWithCredential(user, cred)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await accountService.reauthenticate(currentPassword)
    await updatePassword(getAuth().currentUser!, newPassword)
  },

  // Envía email de verificación al nuevo email
  async changeEmail(currentPassword: string, newEmail: string): Promise<void> {
    await accountService.reauthenticate(currentPassword)
    await verifyBeforeUpdateEmail(getAuth().currentUser!, newEmail)
    // Actualizar Firestore se hace cuando el usuario verifique el nuevo email
    // (simplificación: actualizar Firestore inmediatamente con el nuevo email)
  },

  async deleteAccount(currentPassword: string): Promise<void> {
    await accountService.reauthenticate(currentPassword)
    await deleteUser(getAuth().currentUser!)
  },
}
```

---

## Store Perfil

```typescript
// stores/profile.store.ts (parte del authStore o separado)
export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  let unsub: (() => void) | null = null

  function subscribe(userId: string) {
    unsub?.()
    unsub = profileService.watchProfile(userId, (p) => {
      profile.value = p
    })
  }

  function unsubscribe() {
    unsub?.()
    unsub = null
  }

  async function saveNickname(userId: string, nickname: string) {
    await profileService.saveNickname(userId, nickname)
  }

  async function saveDisplayName(userId: string, firstName: string, lastName: string) {
    await profileService.saveDisplayName(userId, { firstName, lastName })
  }

  async function saveBodyMeasurements(userId: string, heightCm: number | null, weightKg: number | null) {
    await profileService.saveBodyMeasurements(userId, { heightCm, weightKg })
  }

  async function togglePrivacy(userId: string) {
    const current = profile.value?.isPrivate ?? false
    await profileService.saveIsPrivate(userId, !current)
  }

  return {
    profile, loading,
    subscribe, unsubscribe,
    saveNickname, saveDisplayName, saveBodyMeasurements, togglePrivacy,
  }
})
```

---

## UI — Settings Page (`/train/settings`)

### Layout

```
AppBar: "Configuración"

─────────────────────────────

PERFIL
┌──────────────────────────────┐
│ 🧑 [Avatar]                  │
│ Carlos M.                    │
│ @carlosfit  ·  Nivel 12      │
│ [Editar perfil]              │
└──────────────────────────────┘

CUENTA
  Cambiar email              →
  Cambiar contraseña         →

PRIVACIDAD
  Perfil privado        [toggle]

OBJETIVO SEMANAL
  Meta: 4 entrenamientos/semana
  [  −  ]  4  [  +  ]
  [Guardar]

SESIÓN
  [Cerrar sesión]

ZONA DE PELIGRO
  [Eliminar cuenta]
```

---

## Secciones detalladas

### 1. Perfil

- Avatar: circulo con foto o inicial del nickname
- Nickname + nivel XP
- Botón "Editar perfil" → modal o subpágina con:
  - Nickname (texto, max 30 chars)
  - Nombre + apellido
  - Altura (cm)
  - Peso (kg)
  - [Guardar]

### 2. Cambiar email

```
┌─────────────────────────────────┐
│ Contraseña actual               │
│ ┌─────────────────────────────┐ │
│ │ ••••••••                👁️ │ │
│ └─────────────────────────────┘ │
│ Nuevo email                     │
│ ┌─────────────────────────────┐ │
│ │ nuevo@email.com             │ │
│ └─────────────────────────────┘ │
│ [Cambiar email]                 │
│                                 │
│ ℹ️ Recibirás un email de        │
│    verificación                 │
└─────────────────────────────────┘
```

### 3. Cambiar contraseña

```
┌─────────────────────────────────┐
│ Contraseña actual               │
│ ┌─────────────────────────────┐ │
│ │ ••••••••                👁️ │ │
│ └─────────────────────────────┘ │
│ Nueva contraseña (mín. 6 chars) │
│ ┌─────────────────────────────┐ │
│ │ ••••••••                👁️ │ │
│ └─────────────────────────────┘ │
│ Confirmar nueva contraseña      │
│ ┌─────────────────────────────┐ │
│ │ ••••••••                   │ │
│ └─────────────────────────────┘ │
│ [Cambiar contraseña]            │
└─────────────────────────────────┘
```

### 4. Privacidad

```
Perfil privado                [⬛→]
Requiere aprobación para seguirte
```

- Toggle switch
- Al activar: aviso "Los nuevos seguidores necesitarán tu aprobación"
- Escritura inmediata en Firestore

### 5. Objetivo semanal

```
Entrenamientos por semana

[  −  ]  [  4  ]  [  +  ]

Esta semana: 2 / 4 completados

[Guardar]
```

- Stepper: mín 1, máx 7
- Muestra progreso actual de la semana (computed desde workouts)
- Guardar en `users/{uid}.weeklyGoalTarget` (campo simple)

### 6. Cerrar sesión

- Botón secundario (no destructivo en apariencia)
- Sin confirmación — Firebase Auth maneja el redirect

### 7. Eliminar cuenta

- Color rojo/destructivo
- Confirmación doble:
  1. Dialog: "¿Estás seguro? Esta acción es irreversible"
  2. Si confirma: pedir contraseña actual → `accountService.deleteAccount()`
- Tras eliminar: signOut + redirect a `/train/auth/login`

---

## Objetivo semanal — cálculo progreso

```typescript
// composables/useWeeklyGoal.ts
export function useWeeklyGoal(userId: string) {
  const { data: workouts } = useAsyncData(() =>
    workoutService.fetchWorkoutsThisWeek(userId)
  )

  const profile = useProfileStore().profile
  const target = computed(() => profile?.weeklyGoalTarget ?? 3)
  const completed = computed(() => workouts.value?.length ?? 0)
  const progress = computed(() => Math.min(completed.value / target.value, 1))

  return { target, completed, progress }
}
```

Fetch workouts de la semana actual:
```typescript
async fetchWorkoutsThisWeek(userId: string): Promise<WorkoutSummary[]> {
  const monday = getMonday(new Date())  // lunes 00:00:00
  const snap = await getDocs(query(
    collection(db, 'workouts'),
    where('userId', '==', userId),
    where('isCompleted', '==', true),
    where('startedAt', '>=', Timestamp.fromDate(monday)),
    orderBy('startedAt', 'desc')
  ))
  return snap.docs.map(d => mapWorkoutSummary(d))
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}
```

---

## Validaciones

| Campo | Regla |
|---|---|
| Nickname | 3–30 chars, sin espacios al inicio/final |
| Altura | 50–300 cm |
| Peso | 20–500 kg |
| Email | Formato válido |
| Contraseña nueva | Mínimo 6 chars |
| Confirmar contraseña | Debe coincidir |
| Objetivo semanal | 1–7 |

---

## Errores Auth → mensajes

| Código | Mensaje |
|--------|---------|
| `auth/wrong-password` | Contraseña actual incorrecta |
| `auth/requires-recent-login` | Vuelve a iniciar sesión e inténtalo |
| `auth/email-already-in-use` | Ese email ya está en uso |
| `auth/weak-password` | La contraseña es demasiado corta |

---

## Decisiones técnicas

- Perfil en stream real-time → settings siempre refleja estado actual
- Reautenticación requerida para: cambiar email, cambiar contraseña, eliminar cuenta
- `verifyBeforeUpdateEmail` envía email al nuevo correo antes de cambiar — más seguro
- `weeklyGoalTarget` como campo simple en `users` doc (no subcollección)
- El historial de objetivos semanales lo escribe la Cloud Function `weeklyGoalReset`
- Sin subida de foto en MVP web (complejidad con Storage + resize)
