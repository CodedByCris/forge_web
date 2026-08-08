# CMS — Base, autenticación y layout — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sub-proyecto 1 de `/cms`: login de administrador (Firebase Auth client-side, gate por `users/{uid}.isAdmin`), layout con sidebar/topbar mostrando los 7 módulos futuros como "Próximamente", y la arquitectura mínima (store Pinia + plugin + middleware) sobre la que se montarán los sub-proyectos de contenido.

**Architecture:** 100% client-side, sin `server/` ni Firebase Admin SDK — el sitio se genera estático (`nitro.preset: 'static'`, deploy FTP a Hostinger sin Node), así que se replica el patrón ya validado en producción en `Huby-CMS` (mismo hosting): Firebase Auth + Pinia store + middleware Nuxt ejecutándose client-side vía `routeRules: { '/cms/**': { ssr: false } }`.

**Tech Stack:** Nuxt 4, Pinia, Firebase JS SDK v10+ (modular, ya instalado), Tailwind CSS, lucide-vue-next. Cero dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-08-08-cms-base-auth-design.md`

---

## Nota sobre este plan

Este repo tiene una regla explícita en `.claude/CLAUDE.md`: **nunca hacer
commits automáticos** — el trabajo se deja en el working tree y el usuario
decide cuándo y qué commitear. Por eso las tareas de este plan **no incluyen
pasos de `git commit`** (a diferencia del formato estándar de esta skill).
Tampoco hay pasos de tests automatizados — `CLAUDE.md` dice explícitamente
"Sin tests" para todo el repo — cada tarea termina en un paso de
**verificación manual** en su lugar.

---

### Task 1: `routeRules` para `/cms/**` sin SSR

Sin esto, cualquier intento de usar Firebase Auth / Pinia store en las
páginas de `/cms` fallaría en el paso de prerender de `npm run generate`
(Firebase App solo se inicializa en el plugin `.client.ts`, no existe durante
el prerender en Node).

**Files:**
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Añadir la routeRule**

En `nuxt.config.ts`, añadir la clave `routeRules` al objeto de configuración
(no existe todavía en el archivo — el spec de eliminación de `/train`
confirma que esa era la misma técnica usada allí antes de borrarse):

```ts
  routeRules: {
    '/cms/**': { ssr: false },
  },
```

Insertar justo después del bloque `nitro: { preset: 'static' }` y antes de
`css: ['~/assets/css/main.css']`.

- [ ] **Step 2: Verificar manualmente**

Run: `npm run dev`

Abrir `http://localhost:3000/cms` en el navegador. Debe seguir mostrando
"Hola mundo" (el placeholder actual) sin errores en consola. Esto confirma
que la routeRule no rompe nada todavía (no hay lógica nueva aún).

---

### Task 2: Tokens de color `forge.warning` / `forge.danger`

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Añadir los dos tokens que faltan**

En `tailwind.config.ts`, dentro de `theme.extend.colors.forge`, añadir dos
líneas después de `xp`:

```ts
        forge: {
          bg:        '#0F0F0F',
          surface:   '#1A1A1A',
          surfaceAlt:'#242424',
          primary:   '#FF6200',
          accent:    '#FF9A3C',
          text:      '#EEEEEE',
          textSec:   '#CCCCCC',
          muted:     '#666666',
          success:   '#10B981',
          divider:   '#2A2A2A',
          xp:        '#8B5CF6',
          warning:   '#F59E0B',
          danger:    '#EF4444',
        },
```

- [ ] **Step 2: Verificar manualmente**

Run: `npm run dev` (si ya estaba corriendo, Vite recarga el config solo).

No debe haber errores de compilación de Tailwind. No hace falta usar las
clases todavía para confirmar que compilan — Tailwind con JIT no falla por
tokens sin usar.

---

### Task 3: Store Pinia `useCmsAuthStore`

Réplica del patrón de `Huby-CMS/src/features/auth/stores/authStore.ts`
adaptada a este repo (Firebase modular v10+, TypeScript estricto sin `any`).

**Files:**
- Create: `app/stores/cms/auth.store.ts`

- [ ] **Step 1: Escribir el store completo**

```ts
// app/stores/cms/auth.store.ts
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
    return userDoc.data().isAdmin === true
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
        await applyAuthResult(firebaseUser)
        initialized.value = true
        unsubscribe()
        resolve()
      })
    })
  }

  function init(): void {
    onAuthStateChanged(getAuth(), async (firebaseUser) => {
      await applyAuthResult(firebaseUser)
      initialized.value = true
    })
  }

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const credential = await signInWithEmailAndPassword(getAuth(), email, password)
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
```

- [ ] **Step 2: Verificar manualmente**

Run: `npx vue-tsc --noEmit` (o el comando de type-check que use el repo si
existe uno en `package.json`; si no existe, usar `npx nuxi typecheck`).

Expected: sin errores de tipos en `app/stores/cms/auth.store.ts`. Este store
no se puede probar en el navegador todavía — no hay ninguna página que lo use
(eso llega en las tareas 6 y 8).

---

### Task 4: Plugin que arranca la suscripción de auth

**Files:**
- Create: `app/plugins/02.cms-auth.client.ts`

- [ ] **Step 1: Escribir el plugin**

El prefijo `02.` (después de `01.firebase.client.ts`) garantiza que Firebase
ya está inicializado cuando este plugin corre.

```ts
// app/plugins/02.cms-auth.client.ts
import { useCmsAuthStore } from '~/stores/cms/auth.store'

export default defineNuxtPlugin(() => {
  const authStore = useCmsAuthStore()
  authStore.init()
})
```

- [ ] **Step 2: Verificar manualmente**

Run: `npm run dev`, abrir `http://localhost:3000` (la portada, no `/cms`) en
el navegador.

Expected: la portada sigue funcionando exactamente igual que antes (este
plugin no toca nada visible todavía), sin errores en la consola del
navegador. Confirma que suscribirse a `onAuthStateChanged` en cada carga de
página no rompe nada fuera de `/cms`.

---

### Task 5: Middleware de protección de `/cms/**`

**Files:**
- Create: `app/middleware/cms-auth.global.ts`

- [ ] **Step 1: Escribir el middleware**

```ts
// app/middleware/cms-auth.global.ts
import { useCmsAuthStore } from '~/stores/cms/auth.store'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/cms')) return

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
```

- [ ] **Step 2: Verificar manualmente**

Run: `npm run dev`, navegar a `http://localhost:3000/cms`.

Expected: la página tarda un instante (espera a `waitForAuth()`) y no
redirige a ningún sitio todavía porque `/cms/login` no existe aún — puede
mostrar un error 404 al intentar `navigateTo('/cms/login')`, eso es
esperado en este punto intermedio y se resuelve en la Task 8. No debe haber
un bucle infinito de redirecciones ni un error de "authStore is not
defined".

---

### Task 6: Layout `cms` con sidebar y topbar

**Files:**
- Create: `app/components/cms/layout/CmsSidebar.vue`
- Create: `app/components/cms/layout/CmsTopbar.vue`
- Create: `app/layouts/cms.vue`

- [ ] **Step 1: `CmsSidebar.vue`**

```vue
<script setup lang="ts">
import {
  LayoutDashboard,
  Dumbbell,
  FileText,
  HelpCircle,
  Users,
  ShieldAlert,
  Bell,
  Settings,
  LogOut,
} from 'lucide-vue-next'
import { useCmsAuthStore } from '~/stores/cms/auth.store'

const authStore = useCmsAuthStore()
const sidebarOpen = useState('cms-sidebar-open', () => false)

const comingSoon = [
  { label: 'Ejercicios', icon: Dumbbell },
  { label: 'Legal', icon: FileText },
  { label: 'FAQ', icon: HelpCircle },
  { label: 'Usuarios', icon: Users },
  { label: 'Moderación', icon: ShieldAlert },
  { label: 'Notificaciones', icon: Bell },
  { label: 'Configuración', icon: Settings },
]

async function handleLogout() {
  await authStore.logout()
  await navigateTo('/cms/login')
}
</script>

<template>
  <div
    v-if="sidebarOpen"
    class="fixed inset-0 z-30 bg-black/60 lg:hidden"
    @click="sidebarOpen = false"
  />

  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-forge-divider bg-forge-surface transition-transform duration-300 ease-out lg:static lg:translate-x-0"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="px-5 py-6">
      <span class="text-lg font-bold text-forge-text">
        Forge <span class="text-forge-primary">CMS</span>
      </span>
    </div>

    <nav class="flex-1 space-y-1 px-3">
      <NuxtLink
        to="/cms"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <LayoutDashboard class="h-4 w-4" />
        Dashboard
      </NuxtLink>

      <div
        v-for="item in comingSoon"
        :key="item.label"
        class="flex cursor-not-allowed items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-forge-muted"
      >
        <span class="flex items-center gap-3">
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </span>
        <span class="rounded bg-forge-surfaceAlt px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-forge-muted">
          Próximamente
        </span>
      </div>
    </nav>

    <div class="space-y-2 border-t border-forge-divider px-3 py-4">
      <p class="truncate px-3 text-xs text-forge-muted">{{ authStore.user?.email }}</p>
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-forge-textSec transition-colors hover:bg-forge-surfaceAlt hover:text-forge-text"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
```

- [ ] **Step 2: `CmsTopbar.vue`**

```vue
<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

const sidebarOpen = useState('cms-sidebar-open', () => false)
</script>

<template>
  <header class="flex h-14 items-center gap-3 border-b border-forge-divider bg-forge-bg px-4 lg:px-6">
    <button
      type="button"
      class="text-forge-textSec lg:hidden"
      aria-label="Abrir menú"
      @click="sidebarOpen = true"
    >
      <Menu class="h-5 w-5" />
    </button>
  </header>
</template>
```

- [ ] **Step 3: `app/layouts/cms.vue`**

```vue
<template>
  <div class="flex min-h-screen bg-forge-bg text-forge-text">
    <CmsSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <CmsTopbar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Verificar manualmente**

Run: `npx vue-tsc --noEmit`

Expected: sin errores de tipos. Este layout todavía no se usa desde ninguna
página (eso ocurre en la Task 9) así que no hay nada que ver en el navegador
todavía.

---

### Task 7: Componente `EmptyState`

Solo se crea este componente compartido en este sub-proyecto — `StatCard` y
`ConfirmModal` (mencionados en el spec original como estructura) no se
construyen todavía porque nada los usa aquí (no hay KPIs reales ni acciones
destructivas en el dashboard vacío). Se crean en el primer sub-proyecto de
contenido que sí los necesite, para no adivinar su forma sin un caso de uso
real.

**Files:**
- Create: `app/components/cms/shared/EmptyState.vue`

- [ ] **Step 1: Escribir el componente**

```vue
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-forge-divider px-6 py-20 text-center">
    <p class="text-lg font-semibold text-forge-text">{{ title }}</p>
    <p v-if="description" class="mt-2 max-w-sm text-sm text-forge-muted">
      {{ description }}
    </p>
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Run: `npx vue-tsc --noEmit`

Expected: sin errores de tipos.

---

### Task 8: Página de login `/cms/login`

**Files:**
- Create: `app/pages/cms/login.vue`

- [ ] **Step 1: Escribir la página**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useCmsAuthStore } from '~/stores/cms/auth.store'

definePageMeta({ layout: false })

const authStore = useCmsAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleSubmit() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    await navigateTo('/cms')
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-forge-bg px-4">
    <div class="w-full max-w-sm rounded-2xl border border-forge-divider bg-forge-surface p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-forge-text">
          Forge <span class="text-forge-primary">CMS</span>
        </h1>
        <p class="mt-2 text-sm text-forge-muted">Acceso restringido a administradores</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="username"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2.5 text-sm text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Contraseña
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2.5 pr-10 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-forge-muted"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <p v-if="authStore.error" class="text-sm text-forge-danger">
          {{ authStore.error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full rounded-lg bg-forge-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forge-accent disabled:opacity-60"
        >
          {{ authStore.loading ? 'Entrando…' : 'Iniciar sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar manualmente**

Run: `npm run dev`, navegar a `http://localhost:3000/cms`.

Expected: ahora redirige limpiamente a `/cms/login` (sin 404) y muestra el
formulario. Escribir un email/contraseña cualquiera y enviar: como todavía
no existe ningún usuario con `isAdmin: true` en Firestore (eso es la Task
10), el resultado esperado en este punto es un mensaje de error inline
("Usuario no encontrado.", "Credenciales incorrectas." o similar) — no un
crash ni una pantalla en blanco.

---

### Task 9: Dashboard `/cms` con el layout nuevo

**Files:**
- Modify: `app/pages/cms/index.vue`

- [ ] **Step 1: Sustituir el placeholder**

Reemplazar el contenido completo del archivo actual:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'cms' })
</script>

<template>
  <EmptyState
    title="Aún no hay módulos con datos"
    description="Empieza por Ejercicios, Legal o FAQ para ver contenido real aquí."
  />
</template>
```

- [ ] **Step 2: Verificar manualmente**

Run: `npm run dev`.

Sin sesión iniciada, navegar a `http://localhost:3000/cms` → debe redirigir
a `/cms/login` (todavía no hay forma de pasar el login hasta la Task 10, así
que este paso solo confirma que el redirect sigue funcionando con el
dashboard ya montado detrás).

---

### Task 10: Asignar `isAdmin: true` al usuario admin en Firestore

**Requiere confirmación explícita del usuario antes de escribir en la base
de datos de producción (`gym-app-41fd6`).** No se ejecuta la escritura sin
esa confirmación, aunque el resto de pasos (buscar el usuario) sí se pueden
hacer en modo solo-lectura primero.

**Files:** ninguno del repo — operación directa sobre Firestore/Firebase
Auth vía script temporal, no versionado.

- [ ] **Step 1: Confirmar sesión de Firebase CLI**

Run: `firebase login:list`

Expected: muestra una cuenta ya autenticada con acceso al proyecto
`gym-app-41fd6`. Si no hay ninguna, ejecutar `firebase login` antes de
continuar.

- [ ] **Step 2: Buscar el UID del usuario admin (solo lectura)**

Crear un script temporal en el scratchpad (no en el repo) que use
`firebase-admin` con Application Default Credentials para buscar el usuario
de Firebase Auth por email y comprobar si ya tiene un documento en
`users/{uid}`:

```js
// /private/tmp/.../scratchpad/find-admin-user.mjs
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp({
  credential: applicationDefault(),
  projectId: 'gym-app-41fd6',
})

const email = process.argv[2]
if (!email) throw new Error('Uso: node find-admin-user.mjs <email>')

const authUser = await getAuth().getUserByEmail(email)
console.log('UID:', authUser.uid)

const userDoc = await getFirestore().collection('users').doc(authUser.uid).get()
console.log('Documento users/{uid} existe:', userDoc.exists)
console.log('isAdmin actual:', userDoc.data()?.isAdmin ?? '(campo no existe)')
```

Run (instalar `firebase-admin` solo como dependencia temporal del script, no
del repo — `npm install --no-save firebase-admin` desde el directorio del
scratchpad, o `npx --yes firebase-admin` si npm lo permite como script
suelto): `node find-admin-user.mjs cristianarellanoagudo@gmail.com`

Expected: imprime un UID real y el estado actual de `isAdmin` (probablemente
"no existe" la primera vez).

- [ ] **Step 3: Pausa — confirmar con el usuario antes de escribir**

Mostrar al usuario el UID y el email encontrados, y pedir confirmación
explícita antes de continuar al siguiente paso. No escribir nada en
Firestore sin un "sí, adelante" explícito para ese UID concreto.

- [ ] **Step 4: Escribir `isAdmin: true` (tras confirmación)**

Ampliar el mismo script (o uno nuevo) para hacer el `set` con `merge: true`
(para no pisar el resto del documento):

```js
await getFirestore().collection('users').doc(authUser.uid).set(
  { isAdmin: true },
  { merge: true },
)
console.log('isAdmin: true escrito en users/' + authUser.uid)
```

- [ ] **Step 5: Verificar manualmente**

Volver a `http://localhost:3000/cms/login` (Task 8) e iniciar sesión con ese
email/contraseña real de Firebase Auth.

Expected: entra a `/cms`, ve el sidebar completo con los 7 módulos marcados
"Próximamente" y el dashboard con el `EmptyState`. Cerrar sesión (botón en
el sidebar) → vuelve a `/cms/login`. Recargar la página en `/cms/login` tras
haber cerrado sesión → se queda en login (no hay redirect loop). Volver a
entrar con las mismas credenciales → funciona de nuevo.

Borrar el script temporal del scratchpad al terminar (no forma parte del
repo).

---

### Task 11: Actualizar `BACKEND.md` de este repo

**Files:**
- Modify: `.claude/BACKEND.md:12-37`

- [ ] **Step 1: Añadir el campo `isAdmin` al bloque `users/{userId}`**

En `.claude/BACKEND.md`, dentro del bloque de código del esquema
`users/{userId}` (líneas 14-37), añadir una línea nueva justo antes del
cierre `}` (después de `fcmToken`):

```ts
  fcmToken: string | null     // ⚠️ en progreso en `forge` (2026-08-08) — token FCM del dispositivo móvil, para push. La web no lo usa ni lo escribe.
  isAdmin: boolean            // NUEVO (2026-08-08) — gate de acceso a /cms. Solo el CMS lo lee; nadie lo escribe desde código, se asigna a mano en Firestore/Firebase Auth. Ver forge_web/.claude/CLAUDE.md y docs/superpowers/specs/2026-08-08-cms-base-auth-design.md.
```

- [ ] **Step 2: Verificar manualmente**

Leer el archivo tras el cambio y confirmar que el bloque de código sigue
siendo JSON/TS válido (llaves balanceadas, sin coma colgante rota).

---

### Task 12: Actualizar `BACKEND.md` de `forge` (app móvil)

Regla de sincronización ya definida en `CLAUDE.md`: los campos compartidos
entre `forge` y `forge_web` no pueden divergir ni quedar desactualizados
entre repos.

**Files:**
- Modify: `/Users/cris/Desktop/forge/.claude/BACKEND.md:53-55`

- [ ] **Step 1: Añadir el campo `isAdmin` al bloque `users`**

En `/Users/cris/Desktop/forge/.claude/BACKEND.md`, dentro del bloque de
código del esquema `users` (líneas 25-56), añadir una línea nueva justo
antes del cierre `}` (después de `friends`):

```json
  "friends": "string[] | null — array legacy de UIDs de amigos (sustituido por /follows)",
  "isAdmin": "boolean — NUEVO (2026-08-08). Gate de acceso a forge_web/cms. La app móvil no lo usa ni lo escribe — es exclusivo del CMS web. Se asigna a mano en Firestore, nunca desde código. Ver forge_web/.claude/BACKEND.md y forge_web/docs/superpowers/specs/2026-08-08-cms-base-auth-design.md."
```

- [ ] **Step 2: Verificar manualmente**

Leer el archivo tras el cambio y confirmar que el bloque de código sigue
siendo JSON válido.

---

### Task 13: Verificación final de build completo

**Files:** ninguno — solo verificación.

- [ ] **Step 1: Build/generate completo**

Run: `npm run generate`

Expected: completa sin errores de tipos ni imports rotos. Esto es lo más
cercano a "cómo se despliega de verdad" (Hostinger recibe el contenido de
`.output/public/`) — confirma que `routeRules: { '/cms/**': { ssr: false } }`
no rompe el prerender del resto del sitio.

- [ ] **Step 2: Recorrido manual completo**

Con `npm run dev` corriendo:

1. `/` (portada) — sigue funcionando exactamente igual que antes de este
   plan.
2. `/cms` sin sesión → redirige a `/cms/login`.
3. Login con credenciales incorrectas → error inline, formulario no se
   limpia, no navega.
4. Login con el usuario admin real (Task 10) → entra a `/cms`, ve el
   sidebar completo (Dashboard activo + 7 módulos "Próximamente"), ve el
   `EmptyState` del dashboard.
5. Recargar la página estando en `/cms` → sigue autenticado (no rebota a
   login), sin parpadeo visible de "no autenticado".
6. Redimensionar la ventana a ancho móvil → el sidebar se oculta, aparece el
   botón de menú en el topbar, al pulsarlo se abre como drawer con overlay,
   al pulsar el overlay se cierra.
7. Cerrar sesión → vuelve a `/cms/login`. Intentar volver a `/cms`
   directamente por URL → redirige de nuevo a login.

No se crea ningún commit — el trabajo queda en el working tree para que el
usuario lo revise y commitee cuando quiera.
