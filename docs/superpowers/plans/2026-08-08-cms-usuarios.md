# CMS — Módulo Usuarios — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el módulo Usuarios del CMS: listado (18 usuarios reales, sin paginación), detalle con historial de workouts, y dos acciones de moderación (ajustar XP/coins por delta, resetear racha) — más la regla de Firestore necesaria en `forge` para que esas dos acciones funcionen.

**Architecture:** Mismo patrón que Base+Auth: `services → stores → composables/pages → components`, 100% client-side (Firebase SDK modular), Tailwind puro con la paleta `forge.*` ya existente, sin Nuxt UI, sin i18n, sin tests.

**Tech Stack:** Nuxt 4, Pinia, Firebase JS SDK v10+. Cero dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-08-08-cms-usuarios-design.md`

---

## Nota sobre este plan

Sin `git commit` en ninguna tarea (regla del repo — el trabajo queda en el
working tree). Sin tests — verificación manual en cada tarea. La Task 1
modifica un archivo de **otro repo** (`forge/firestore.rules`) que gobierna
producción — se prepara el diff pero **no se despliega** sin confirmación
explícita del usuario, igual que se hizo con `isAdmin: true` en el módulo
Base+Auth.

**Decisión de simplificación respecto al spec**: el spec menciona "toast de
éxito/error" para las acciones de moderación, pero este repo no tiene ningún
sistema de toast (existía uno en `/train`, se eliminó por completo junto con
esa zona). Construir un sistema de toast global es una pieza de
infraestructura aparte, no pedida explícitamente y no necesaria para dos
acciones puntuales. En su lugar, cada acción muestra un mensaje de
éxito/error **inline**, junto al botón que la disparó — mismo objetivo
(feedback visual claro), sin infraestructura nueva.

**Decisión de simplificación #2**: el spec mencionaba `ResetStreakModal.vue`
como componente propio. Como resetear racha no necesita ningún input (solo
confirmar), se implementa reutilizando `ConfirmModal.vue` directamente desde
la página de detalle — un archivo menos, mismo resultado.

---

### Task 1: Preparar (sin desplegar) la regla nueva en `forge/firestore.rules`

**Requiere confirmación explícita del usuario antes de cualquier
`firebase deploy`.** Esta tarea solo prepara el diff — el propio usuario (o
una sesión suya en el repo `forge`) decide cuándo y si lo despliega.

**Files:**
- Modify: `/Users/cris/Desktop/forge/firestore.rules:59-66`

- [ ] **Step 1: Ver el bloque actual**

El bloque `match /users/{userId}` (líneas 53-67 de
`/Users/cris/Desktop/forge/firestore.rules`) tiene hoy:

```javascript
match /users/{userId} {
  allow read: if isSignedIn();
  // `isAdmin` nunca se puede fijar desde el cliente (ni al crear ni al
  // actualizar) — evita que un usuario se autopromueva a admin del CMS.
  allow create: if isOwner(userId) &&
    (!('isAdmin' in request.resource.data) || request.resource.data.isAdmin == false);
  allow update: if (
    isOwner(userId) && !('isAdmin' in changedKeys())
  ) || (
    isSignedIn() &&
    onlyChanged(['followersCount', 'followingCount', 'friends']) &&
    changedByOne('followersCount') &&
    changedByOne('followingCount')
  );
  allow delete: if isOwner(userId);
```

- [ ] **Step 2: Añadir la tercera rama del `allow update`**

Reemplazar el bloque `allow update` completo por (añade una tercera rama
`||` para el admin del CMS, usando los helpers `isAdmin()` y `onlyChanged()`
ya definidos en el propio archivo — no se inventa sintaxis nueva):

```javascript
  allow update: if (
    isOwner(userId) && !('isAdmin' in changedKeys())
  ) || (
    isSignedIn() &&
    onlyChanged(['followersCount', 'followingCount', 'friends']) &&
    changedByOne('followersCount') &&
    changedByOne('followingCount')
  ) || (
    // Admin del CMS (forge_web/cms) ajustando XP/coins/racha de otro
    // usuario — acotado a estos tres campos exactos, nunca isAdmin,
    // email, ni datos de perfil. Ver forge_web/docs/superpowers/specs/
    // 2026-08-08-cms-usuarios-design.md.
    isAdmin() && onlyChanged(['totalXp', 'coins', 'currentStreak'])
  );
```

- [ ] **Step 3: Verificar sintaxis sin desplegar**

Run (desde `/Users/cris/Desktop/forge`):
```bash
firebase deploy --only firestore:rules --dry-run
```

Si `--dry-run` no está soportado por la versión de CLI instalada, usar en su
lugar el validador de compilación local:
```bash
firebase firestore:rules:release --help 2>&1 | head -5   # solo para confirmar el CLI responde
```
y una revisión manual línea por línea de que las llaves/paréntesis cierran
correctamente (edición pequeña y acotada, bajo riesgo).

**NO ejecutar `firebase deploy --only firestore:rules` (sin `--dry-run`) en
esta tarea.** Reportar el diff aplicado y esperar confirmación explícita del
usuario antes de que cualquier despliegue real ocurra.

---

### Task 2: Documentar `currentStreak` en `forge_web/.claude/BACKEND.md`

**Files:**
- Modify: `.claude/BACKEND.md:34-36`

- [ ] **Step 1: Añadir el campo**

En el bloque `users/{userId}` de `.claude/BACKEND.md`, añadir una línea
nueva después de `coins` (antes de `lastXpDate`):

```typescript
  coins: number
  currentStreak: number       // NUEVO en la doc (2026-08-08) — ya existía en producción, documentado en forge/.claude/BACKEND.md pero no aquí. Días consecutivos con workout, actualizado por Cloud Function `dailyStreakReset`.
  lastXpDate: string | null   // 'YYYY-MM-DD'
```

- [ ] **Step 2: Verificar manualmente**

Leer el archivo y confirmar que el bloque de código sigue siendo TypeScript
válido.

---

### Task 3: Tipos TypeScript del módulo

**Files:**
- Create: `app/types/cms/user.ts`

- [ ] **Step 1: Escribir los tipos**

```typescript
// app/types/cms/user.ts
export interface CmsUser {
  uid: string
  email: string
  nickname: string
  photoUrl: string | null
  buildType: string | null
  isAdmin: boolean
  isPrivate: boolean
  totalXp: number
  coins: number
  currentStreak: number
  followersCount: number
  followingCount: number
  activeTitle: string | null
  createdAt: Date | null
}

export interface CmsWorkoutSummary {
  id: string
  name: string
  startedAt: Date | null
  endedAt: Date | null
}
```

- [ ] **Step 2: Verificar manualmente**

Run: `npx vue-tsc --noEmit --project .nuxt/tsconfig.json` (puede requerir
`npx nuxi prepare` antes si `.nuxt/tsconfig.json` no existe o está
desactualizado). Expected: sin errores nuevos (los 2 preexistentes en
`app.vue`/`error.vue` no cuentan).

---

### Task 4: Servicio `users.service.ts`

**Files:**
- Create: `app/services/cms/users.service.ts`

- [ ] **Step 1: Escribir el servicio**

```typescript
// app/services/cms/users.service.ts
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import type { CmsUser, CmsWorkoutSummary } from '~/types/cms/user'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getUsers(): Promise<CmsUser[]> {
  const db = getFirestore()
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      uid: d.id,
      email: data.email ?? '',
      nickname: data.nickname ?? '',
      photoUrl: data.photoUrl ?? null,
      buildType: data.buildType ?? null,
      isAdmin: data.isAdmin === true,
      isPrivate: data.isPrivate === true,
      totalXp: data.totalXp ?? 0,
      coins: data.coins ?? 0,
      currentStreak: data.currentStreak ?? 0,
      followersCount: data.followersCount ?? 0,
      followingCount: data.followingCount ?? 0,
      activeTitle: data.activeTitle ?? null,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

export async function getUserWorkouts(uid: string, limitCount = 10): Promise<CmsWorkoutSummary[]> {
  const db = getFirestore()
  const q = query(
    collection(db, 'workouts'),
    where('userId', '==', uid),
    where('isCompleted', '==', true),
    orderBy('startedAt', 'desc'),
    limit(limitCount),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? '',
      startedAt: toDateOrNull(data.startedAt),
      endedAt: toDateOrNull(data.endedAt),
    }
  })
}

export async function adjustUserXpCoins(uid: string, deltaXp: number, deltaCoins: number): Promise<void> {
  const db = getFirestore()
  const updates: Record<string, ReturnType<typeof increment>> = {}
  if (deltaXp !== 0) updates.totalXp = increment(deltaXp)
  if (deltaCoins !== 0) updates.coins = increment(deltaCoins)
  if (Object.keys(updates).length === 0) return
  await updateDoc(doc(db, 'users', uid), updates)
}

export async function resetUserStreak(uid: string): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'users', uid), { currentStreak: 0 })
}
```

- [ ] **Step 2: Verificar manualmente**

Typecheck (mismo comando que Task 3). Sin errores nuevos.

---

### Task 5: Store `users.store.ts`

**Files:**
- Create: `app/stores/cms/users.store.ts`

- [ ] **Step 1: Escribir el store**

```typescript
// app/stores/cms/users.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsUser, CmsWorkoutSummary } from '~/types/cms/user'
import {
  getUsers,
  getUserWorkouts,
  adjustUserXpCoins,
  resetUserStreak,
} from '~/services/cms/users.service'

export const useCmsUsersStore = defineStore('cmsUsers', () => {
  const users = ref<CmsUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selectedUser = ref<CmsUser | null>(null)
  const selectedUserWorkouts = ref<CmsWorkoutSummary[]>([])
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      users.value = await getUsers()
    } catch {
      error.value = 'No se pudieron cargar los usuarios.'
    } finally {
      loading.value = false
    }
  }

  async function fetchUserDetail(uid: string): Promise<void> {
    detailLoading.value = true
    detailError.value = null
    try {
      if (users.value.length === 0) {
        await fetchUsers()
      }
      selectedUser.value = users.value.find((u) => u.uid === uid) ?? null
      selectedUserWorkouts.value = await getUserWorkouts(uid)
    } catch {
      detailError.value = 'No se pudo cargar el detalle del usuario.'
    } finally {
      detailLoading.value = false
    }
  }

  async function adjustXpCoins(uid: string, deltaXp: number, deltaCoins: number): Promise<boolean> {
    try {
      await adjustUserXpCoins(uid, deltaXp, deltaCoins)
      if (selectedUser.value?.uid === uid) {
        selectedUser.value.totalXp += deltaXp
        selectedUser.value.coins += deltaCoins
      }
      return true
    } catch {
      return false
    }
  }

  async function resetStreak(uid: string): Promise<boolean> {
    try {
      await resetUserStreak(uid)
      if (selectedUser.value?.uid === uid) {
        selectedUser.value.currentStreak = 0
      }
      return true
    } catch {
      return false
    }
  }

  return {
    users,
    loading,
    error,
    selectedUser,
    selectedUserWorkouts,
    detailLoading,
    detailError,
    fetchUsers,
    fetchUserDetail,
    adjustXpCoins,
    resetStreak,
  }
})
```

- [ ] **Step 2: Verificar manualmente**

Typecheck. Sin errores nuevos.

---

### Task 6: Componente `StatCard.vue`

**Files:**
- Create: `app/components/cms/shared/StatCard.vue`

- [ ] **Step 1: Escribir el componente**

```vue
<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<template>
  <div class="rounded-xl border border-forge-divider bg-forge-surface px-4 py-3">
    <p class="text-2xl font-bold text-forge-text">{{ value }}</p>
    <p class="mt-1 text-xs uppercase tracking-wide text-forge-muted">{{ label }}</p>
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Typecheck. Sin errores nuevos.

---

### Task 7: Componente `ConfirmModal.vue`

**Files:**
- Create: `app/components/cms/shared/ConfirmModal.vue`

- [ ] **Step 1: Escribir el componente**

```vue
<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-sm rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">{{ title }}</h2>
      <p class="mt-2 text-sm text-forge-textSec">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="emit('cancel')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="loading"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="emit('confirm')"
        >
          {{ loading ? 'Aplicando…' : (confirmLabel ?? 'Confirmar') }}
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Typecheck. Sin errores nuevos.

---

### Task 8: Componente `UserRow.vue`

**Files:**
- Create: `app/components/cms/users/UserRow.vue`

- [ ] **Step 1: Escribir el componente**

```vue
<script setup lang="ts">
import type { CmsUser } from '~/types/cms/user'

defineProps<{
  user: CmsUser
}>()
</script>

<template>
  <NuxtLink
    :to="`/cms/usuarios/${user.uid}`"
    class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-forge-divider px-4 py-3 text-sm hover:bg-forge-surfaceAlt"
  >
    <img
      v-if="user.photoUrl"
      :src="user.photoUrl"
      :alt="user.nickname"
      class="h-8 w-8 rounded-full object-cover"
    >
    <div
      v-else
      class="flex h-8 w-8 items-center justify-center rounded-full bg-forge-surfaceAlt text-xs font-semibold text-forge-textSec"
    >
      {{ user.nickname.slice(0, 2).toUpperCase() }}
    </div>

    <div class="min-w-0">
      <p class="truncate font-medium text-forge-text">
        {{ user.nickname }}
        <span v-if="user.isAdmin" class="ml-2 rounded bg-forge-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-forge-primary">
          Admin
        </span>
      </p>
      <p class="truncate text-xs text-forge-muted">{{ user.email }}</p>
    </div>

    <span class="text-forge-textSec">{{ user.totalXp }} XP</span>
    <span class="text-forge-textSec">{{ user.coins }} coins</span>
    <span class="text-forge-muted">{{ user.buildType ?? '—' }}</span>
    <span class="text-forge-muted">
      {{ user.createdAt ? user.createdAt.toLocaleDateString('es-ES') : '—' }}
    </span>
  </NuxtLink>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Typecheck. Sin errores nuevos.

---

### Task 9: Componente `UserDetailHeader.vue`

**Files:**
- Create: `app/components/cms/users/UserDetailHeader.vue`

- [ ] **Step 1: Escribir el componente**

```vue
<script setup lang="ts">
import type { CmsUser } from '~/types/cms/user'

defineProps<{
  user: CmsUser
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <img
      v-if="user.photoUrl"
      :src="user.photoUrl"
      :alt="user.nickname"
      class="h-16 w-16 rounded-full object-cover"
    >
    <div
      v-else
      class="flex h-16 w-16 items-center justify-center rounded-full bg-forge-surfaceAlt text-lg font-semibold text-forge-textSec"
    >
      {{ user.nickname.slice(0, 2).toUpperCase() }}
    </div>

    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold text-forge-text">{{ user.nickname }}</h1>
        <span v-if="user.isAdmin" class="rounded bg-forge-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-forge-primary">
          Admin
        </span>
        <span v-if="user.isPrivate" class="rounded bg-forge-surfaceAlt px-1.5 py-0.5 text-[10px] uppercase text-forge-muted">
          Privado
        </span>
      </div>
      <p class="text-sm text-forge-muted">{{ user.email }}</p>
      <p class="mt-1 text-xs text-forge-muted">
        {{ user.buildType ?? 'Sin tipo' }}
        <span v-if="user.activeTitle"> · {{ user.activeTitle }}</span>
        · Registrado el {{ user.createdAt ? user.createdAt.toLocaleDateString('es-ES') : '—' }}
      </p>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Typecheck. Sin errores nuevos.

---

### Task 10: Componente `AdjustXpCoinsModal.vue`

**Files:**
- Create: `app/components/cms/users/AdjustXpCoinsModal.vue`

- [ ] **Step 1: Escribir el componente**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCmsUsersStore } from '~/stores/cms/users.store'

const props = defineProps<{
  open: boolean
  uid: string
}>()

const emit = defineEmits<{
  close: []
}>()

const usersStore = useCmsUsersStore()

const deltaXp = ref(0)
const deltaCoins = ref(0)
const loading = ref(false)
const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

async function handleConfirm() {
  loading.value = true
  feedback.value = null
  const ok = await usersStore.adjustXpCoins(props.uid, deltaXp.value, deltaCoins.value)
  loading.value = false
  if (ok) {
    feedback.value = { type: 'success', message: 'XP y coins actualizados.' }
    deltaXp.value = 0
    deltaCoins.value = 0
    setTimeout(() => emit('close'), 1000)
  } else {
    feedback.value = {
      type: 'error',
      message: 'No se pudo aplicar el cambio. Revisa que las Firestore rules ya permitan esta acción.',
    }
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-sm rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">Ajustar XP / coins</h2>

      <div class="mt-4 space-y-4">
        <div>
          <label for="delta-xp" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Delta XP (puede ser negativo)
          </label>
          <input
            id="delta-xp"
            v-model.number="deltaXp"
            type="number"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>
        <div>
          <label for="delta-coins" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Delta coins (puede ser negativo)
          </label>
          <input
            id="delta-coins"
            v-model.number="deltaCoins"
            type="number"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>
      </div>

      <p
        v-if="feedback"
        class="mt-4 text-sm"
        :class="feedback.type === 'success' ? 'text-forge-success' : 'text-forge-danger'"
      >
        {{ feedback.message }}
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="loading || (deltaXp === 0 && deltaCoins === 0)"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleConfirm"
        >
          {{ loading ? 'Aplicando…' : 'Aplicar' }}
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Typecheck. Sin errores nuevos.

---

### Task 11: Página listado `/cms/usuarios`

**Files:**
- Create: `app/pages/cms/usuarios/index.vue`

- [ ] **Step 1: Escribir la página**

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCmsUsersStore } from '~/stores/cms/users.store'
import UserRow from '~/components/cms/users/UserRow.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const usersStore = useCmsUsersStore()

const search = ref('')
type SortKey = 'totalXp' | 'coins' | 'createdAt'
const sortKey = ref<SortKey>('createdAt')
const sortDesc = ref(true)

onMounted(() => {
  usersStore.fetchUsers()
})

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortKey.value = key
    sortDesc.value = true
  }
}

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()
  let list = usersStore.users
  if (term) {
    list = list.filter(
      (u) => u.nickname.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    )
  }
  return [...list].sort((a, b) => {
    const key = sortKey.value
    const aVal = key === 'createdAt' ? (a.createdAt?.getTime() ?? 0) : a[key]
    const bVal = key === 'createdAt' ? (b.createdAt?.getTime() ?? 0) : b[key]
    return sortDesc.value ? bVal - aVal : aVal - bVal
  })
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Usuarios</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre o email…"
        class="w-64 rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-primary"
      >
    </div>

    <EmptyState
      v-if="usersStore.error"
      title="No se pudieron cargar los usuarios"
      :description="usersStore.error"
    />

    <div v-else-if="usersStore.loading" class="text-sm text-forge-muted">
      Cargando usuarios…
    </div>

    <EmptyState
      v-else-if="filteredUsers.length === 0"
      title="Sin resultados"
      description="Ningún usuario coincide con la búsqueda."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 border-b border-forge-divider bg-forge-surfaceAlt px-4 py-2 text-xs uppercase tracking-wide text-forge-muted">
        <span />
        <span>Usuario</span>
        <button type="button" class="text-left hover:text-forge-text" @click="toggleSort('totalXp')">XP</button>
        <button type="button" class="text-left hover:text-forge-text" @click="toggleSort('coins')">Coins</button>
        <span>Tipo</span>
        <button type="button" class="text-left hover:text-forge-text" @click="toggleSort('createdAt')">Registro</button>
      </div>
      <UserRow v-for="user in filteredUsers" :key="user.uid" :user="user" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Typecheck + `npm run dev` + `curl http://localhost:3000/cms/usuarios` → 200.
Sin errores nuevos en el log del servidor. Matar el proceso dev al terminar.

---

### Task 12: Página detalle `/cms/usuarios/[uid]`

**Files:**
- Create: `app/pages/cms/usuarios/[uid].vue`

- [ ] **Step 1: Escribir la página**

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCmsUsersStore } from '~/stores/cms/users.store'
import StatCard from '~/components/cms/shared/StatCard.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import UserDetailHeader from '~/components/cms/users/UserDetailHeader.vue'
import AdjustXpCoinsModal from '~/components/cms/users/AdjustXpCoinsModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const route = useRoute()
const uid = computed(() => route.params.uid as string)

const usersStore = useCmsUsersStore()

const showAdjustModal = ref(false)
const showResetConfirm = ref(false)
const resettingStreak = ref(false)
const resetFeedback = ref<string | null>(null)

onMounted(() => {
  usersStore.fetchUserDetail(uid.value)
})

async function handleResetStreak() {
  resettingStreak.value = true
  const ok = await usersStore.resetStreak(uid.value)
  resettingStreak.value = false
  showResetConfirm.value = false
  resetFeedback.value = ok ? 'Racha reseteada.' : 'No se pudo resetear la racha.'
  setTimeout(() => { resetFeedback.value = null }, 3000)
}

function formatDuration(start: Date | null, end: Date | null): string {
  if (!start || !end) return '—'
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
  return `${minutes} min`
}
</script>

<template>
  <div>
    <EmptyState
      v-if="usersStore.detailError"
      title="No se pudo cargar el usuario"
      :description="usersStore.detailError"
    />

    <div v-else-if="usersStore.detailLoading" class="text-sm text-forge-muted">
      Cargando usuario…
    </div>

    <EmptyState
      v-else-if="!usersStore.selectedUser"
      title="Usuario no encontrado"
    />

    <template v-else>
      <UserDetailHeader :user="usersStore.selectedUser" />

      <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="XP total" :value="usersStore.selectedUser.totalXp" />
        <StatCard label="Coins" :value="usersStore.selectedUser.coins" />
        <StatCard label="Racha" :value="usersStore.selectedUser.currentStreak" />
        <StatCard label="Seguidores" :value="usersStore.selectedUser.followersCount" />
        <StatCard label="Siguiendo" :value="usersStore.selectedUser.followingCount" />
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
          @click="showAdjustModal = true"
        >
          Ajustar XP / coins
        </button>
        <button
          type="button"
          class="rounded-lg border border-forge-divider px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="showResetConfirm = true"
        >
          Resetear racha
        </button>
      </div>

      <p
        v-if="resetFeedback"
        class="mt-3 text-sm"
        :class="resetFeedback.includes('No se pudo') ? 'text-forge-danger' : 'text-forge-success'"
      >
        {{ resetFeedback }}
      </p>

      <h2 class="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-forge-muted">
        Últimos entrenamientos
      </h2>

      <EmptyState
        v-if="usersStore.selectedUserWorkouts.length === 0"
        title="Sin entrenamientos"
        description="Este usuario todavía no ha completado ningún workout."
      />

      <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
        <div
          v-for="workout in usersStore.selectedUserWorkouts"
          :key="workout.id"
          class="flex items-center justify-between border-b border-forge-divider px-4 py-3 text-sm last:border-b-0"
        >
          <span class="text-forge-text">{{ workout.name }}</span>
          <span class="text-forge-muted">
            {{ workout.startedAt ? workout.startedAt.toLocaleDateString('es-ES') : '—' }}
          </span>
          <span class="text-forge-muted">{{ formatDuration(workout.startedAt, workout.endedAt) }}</span>
        </div>
      </div>
    </template>

    <AdjustXpCoinsModal
      :open="showAdjustModal"
      :uid="uid"
      @close="showAdjustModal = false"
    />

    <ConfirmModal
      :open="showResetConfirm"
      title="Resetear racha"
      :message="`¿Seguro que quieres poner la racha de ${usersStore.selectedUser?.nickname ?? 'este usuario'} a 0?`"
      confirm-label="Resetear"
      :loading="resettingStreak"
      @confirm="handleResetStreak"
      @cancel="showResetConfirm = false"
    />
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Typecheck + `npm run dev` + `curl http://localhost:3000/cms/usuarios/test-uid`
→ 200 (shell SPA, no ejecuta JS vía curl). Matar el proceso dev al terminar.

---

### Task 13: Activar "Usuarios" en el sidebar

**Files:**
- Modify: `app/components/cms/layout/CmsSidebar.vue`

- [ ] **Step 1: Quitar "Usuarios" de la lista `comingSoon` y añadir un `NuxtLink` real**

Cambiar el array `comingSoon` (quitar la entrada de Usuarios):

```typescript
const comingSoon = [
  { label: 'Ejercicios', icon: Dumbbell },
  { label: 'Legal', icon: FileText },
  { label: 'FAQ', icon: HelpCircle },
  { label: 'Moderación', icon: ShieldAlert },
  { label: 'Notificaciones', icon: Bell },
  { label: 'Configuración', icon: Settings },
]
```

Y añadir un `NuxtLink` real para Usuarios en el `<template>`, justo después
del `NuxtLink` de Dashboard y antes del `v-for` de `comingSoon`:

```vue
      <NuxtLink
        to="/cms/usuarios"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <Users class="h-4 w-4" />
        Usuarios
      </NuxtLink>
```

(El import de `Users` desde `lucide-vue-next` ya existe en el archivo — se
usaba para el item "Próximamente" que ahora se convierte en link real, no
hace falta añadir el import.)

- [ ] **Step 2: Verificar manualmente**

Typecheck + `npm run dev` + `curl http://localhost:3000/cms` → 200, sin
errores nuevos. Matar el proceso dev al terminar.

---

### Task 14: Verificación final

**Files:** ninguno — solo verificación.

- [ ] **Step 1: Build completo**

Run: `npm run generate`. Expected: completa sin errores, prerenderiza
`/cms/usuarios` y `/cms/usuarios/[uid]` como shells `ssr:false` (ya cubiertos
por la routeRule `/cms/**` existente — no hace falta tocar `nuxt.config.ts`).

- [ ] **Step 2: Recorrido manual (con `npm run dev`, en el navegador — no vía curl)**

1. Login → sidebar → "Usuarios" ya no dice "Próximamente", es un link real.
2. `/cms/usuarios` muestra los 18 usuarios reales, avatar/iniciales, XP,
   coins, tipo, fecha de registro.
3. Buscar por nombre o email filtra correctamente.
4. Click en las cabeceras de XP/Coins/Registro ordena y alterna asc/desc.
5. Click en un usuario → `/cms/usuarios/[uid]` muestra header, 5 StatCards,
   y el historial de workouts (o el `EmptyState` de "Sin entrenamientos" si
   no tiene ninguno).
6. **Antes del deploy de la Task 1**: "Ajustar XP/coins" y "Resetear racha"
   deben fallar con el mensaje de error inline ("No se pudo aplicar el
   cambio…" / "No se pudo resetear la racha.") — confirma que las rules
   viejas siguen protegiendo correctamente mientras la Task 1 no se
   despliegue.
7. **Después del deploy** (solo si el usuario ya confirmó y ejecutó el
   deploy de la Task 1): repetir el paso 6 y confirmar que esta vez
   funciona, que el valor se actualiza en la UI, y que Firestore refleja el
   cambio real.

No se crea ningún commit — el trabajo queda en el working tree.
