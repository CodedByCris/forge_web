# Moderación (Posts + Rutinas públicas) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/cms/moderacion` con dos pestañas (Posts, Rutinas públicas) que listan contenido reciente y permiten eliminarlo, ampliando las Firestore rules de `posts`/`routines` para que el admin pueda borrar contenido de cualquier usuario.

**Architecture:** Mismo patrón `services → stores → components/pages` que el resto del CMS, 100% client-side.

**Tech Stack:** Nuxt 4/Pinia/Firebase JS SDK. Cero dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-08-08-moderacion-design.md`

---

## Nota sobre este plan

- Commits en `forge_web`: autorizados, uno al final (Task 6). Commits en
  `forge` (Firestore rules): no autorizados.
- Deploy de rules: autorizado sin pausa de confirmación adicional (mismo
  criterio que planes anteriores) — dry-run primero.
- Sin tests.

---

### Task 1: Ampliar `allow delete` en `posts` y `routines` + deploy

**Files:**
- Modify: `/Users/cris/Desktop/forge/firestore.rules:173`
- Modify: `/Users/cris/Desktop/forge/firestore.rules:207`

- [ ] **Step 1**: En el bloque `match /posts/{postId}`, cambiar:
```javascript
      allow delete: if isOwner(resource.data.userId);
```
por:
```javascript
      allow delete: if isOwner(resource.data.userId) || isAdmin();
```

- [ ] **Step 2**: En el bloque `match /routines/{routineId}`, aplicar el
mismo cambio:
```javascript
      allow delete: if isOwner(resource.data.userId) || isAdmin();
```

- [ ] **Step 3**: Confirmar que no se tocó nada más en ninguno de los dos
bloques (`git diff firestore.rules` debe mostrar solo estas dos líneas
modificadas).

- [ ] **Step 4**: Dry-run + deploy.
```bash
cd /Users/cris/Desktop/forge
firebase deploy --only firestore:rules --dry-run
firebase deploy --only firestore:rules
```
Expected: ambos sin errores, el segundo termina en `Deploy complete!`.

- [ ] **Step 5**: Verificar manualmente que la regla nueva funciona y que
la vieja sigue protegiendo lo que debía. Con las credenciales de nivel de
proyecto ya usadas en tareas anteriores de este repo (que bypasan Security
Rules, no sirven para probar la regla en sí), no se puede verificar el
comportamiento de la rule directamente — la verificación real ocurre en la
Task 6 al probar el flujo completo desde el CMS (que sí usa Firebase Auth
del cliente, sujeto a las rules).

---

### Task 2: Tipos CMS

**Files:**
- Create: `app/types/cms/moderation.ts`

- [ ] **Step 1**:

```typescript
// app/types/cms/moderation.ts
export interface CmsModeratedPost {
  id: string
  userNickname: string
  userPhotoUrl: string | null
  workoutName: string
  likesCount: number
  commentsCount: number
  createdAt: Date | null
}

export interface CmsModeratedRoutine {
  id: string
  userNickname: string
  userPhotoUrl: string | null
  name: string
  likesCount: number
  commentsCount: number
  createdAt: Date | null
}
```

- [ ] **Step 2**: Typecheck (`npx vue-tsc --noEmit --project .nuxt/tsconfig.json`,
`npx nuxi prepare` antes si hace falta). Sin errores nuevos.

---

### Task 3: Servicio `moderation.service.ts`

**Files:**
- Create: `app/services/cms/moderation.service.ts`

- [ ] **Step 1**:

```typescript
// app/services/cms/moderation.service.ts
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import type { CmsModeratedPost, CmsModeratedRoutine } from '~/types/cms/moderation'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getRecentPosts(): Promise<CmsModeratedPost[]> {
  const db = getFirestore()
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      userNickname: data.userNickname ?? '',
      userPhotoUrl: data.userPhotoUrl ?? null,
      workoutName: data.workoutName ?? '',
      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

export async function getRecentRoutines(): Promise<CmsModeratedRoutine[]> {
  const db = getFirestore()
  const q = query(
    collection(db, 'routines'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      userNickname: data.userNickname ?? '',
      userPhotoUrl: data.userPhotoUrl ?? null,
      name: data.name ?? '',
      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

export async function deletePost(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'posts', id))
}

export async function deleteRoutine(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'routines', id))
}
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

**Nota**: la query de rutinas (`where('visibility', '==', 'public') +
orderBy('createdAt', 'desc')`) puede requerir un índice compuesto en
Firestore. Si al probar en la Task 6 aparece un error de Firestore pidiendo
crear un índice (con un link directo a la consola para crearlo con un
clic), seguir ese link — es el flujo estándar de Firestore para índices
compuestos nuevos, no algo a prevenir de antemano sin confirmación real de
que hace falta.

---

### Task 4: Store `moderation.store.ts`

**Files:**
- Create: `app/stores/cms/moderation.store.ts`

- [ ] **Step 1**:

```typescript
// app/stores/cms/moderation.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CmsModeratedPost, CmsModeratedRoutine } from '~/types/cms/moderation'
import {
  getRecentPosts,
  getRecentRoutines,
  deletePost,
  deleteRoutine,
} from '~/services/cms/moderation.service'

export const useCmsModerationStore = defineStore('cmsModeration', () => {
  const posts = ref<CmsModeratedPost[]>([])
  const postsLoading = ref(false)
  const postsError = ref<string | null>(null)

  const routines = ref<CmsModeratedRoutine[]>([])
  const routinesLoading = ref(false)
  const routinesError = ref<string | null>(null)

  async function fetchPosts(): Promise<void> {
    postsLoading.value = true
    postsError.value = null
    try {
      posts.value = await getRecentPosts()
    } catch {
      postsError.value = 'No se pudieron cargar los posts.'
    } finally {
      postsLoading.value = false
    }
  }

  async function fetchRoutines(): Promise<void> {
    routinesLoading.value = true
    routinesError.value = null
    try {
      routines.value = await getRecentRoutines()
    } catch {
      routinesError.value = 'No se pudieron cargar las rutinas.'
    } finally {
      routinesLoading.value = false
    }
  }

  async function removePost(id: string): Promise<boolean> {
    try {
      await deletePost(id)
      posts.value = posts.value.filter((p) => p.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function removeRoutine(id: string): Promise<boolean> {
    try {
      await deleteRoutine(id)
      routines.value = routines.value.filter((r) => r.id !== id)
      return true
    } catch {
      return false
    }
  }

  return {
    posts,
    postsLoading,
    postsError,
    routines,
    routinesLoading,
    routinesError,
    fetchPosts,
    fetchRoutines,
    removePost,
    removeRoutine,
  }
})
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

---

### Task 5: Componentes de fila + página + sidebar

**Files:**
- Create: `app/components/cms/moderation/PostModerationRow.vue`
- Create: `app/components/cms/moderation/RoutineModerationRow.vue`
- Create: `app/pages/cms/moderacion/index.vue`
- Modify: `app/components/cms/layout/CmsSidebar.vue`

- [ ] **Step 1**: `PostModerationRow.vue`

```vue
<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import type { CmsModeratedPost } from '~/types/cms/moderation'

defineProps<{
  post: CmsModeratedPost
}>()

const emit = defineEmits<{
  delete: []
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-b border-forge-divider px-4 py-3 text-sm last:border-b-0">
    <img
      v-if="post.userPhotoUrl"
      :src="post.userPhotoUrl"
      :alt="post.userNickname"
      class="h-8 w-8 shrink-0 rounded-full object-cover"
    >
    <div
      v-else
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forge-surfaceAlt text-xs font-semibold text-forge-textSec"
    >
      {{ post.userNickname.slice(0, 2).toUpperCase() }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-forge-text">{{ post.userNickname }}</p>
      <p class="truncate text-xs text-forge-muted">{{ post.workoutName }}</p>
    </div>

    <span class="shrink-0 text-xs text-forge-muted">{{ post.likesCount }} likes · {{ post.commentsCount }} comentarios</span>
    <span class="shrink-0 text-xs text-forge-muted">
      {{ post.createdAt ? post.createdAt.toLocaleDateString('es-ES') : '—' }}
    </span>

    <button
      type="button"
      class="shrink-0 rounded p-2 text-forge-textSec hover:bg-forge-danger/10 hover:text-forge-danger"
      aria-label="Eliminar"
      @click="emit('delete')"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</template>
```

- [ ] **Step 2**: `RoutineModerationRow.vue` — idéntico a `PostModerationRow.vue`
salvo: prop `routine: CmsModeratedRoutine` en vez de `post`, y
`routine.name` en vez de `routine.workoutName` en la segunda línea del
contenido.

```vue
<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import type { CmsModeratedRoutine } from '~/types/cms/moderation'

defineProps<{
  routine: CmsModeratedRoutine
}>()

const emit = defineEmits<{
  delete: []
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-b border-forge-divider px-4 py-3 text-sm last:border-b-0">
    <img
      v-if="routine.userPhotoUrl"
      :src="routine.userPhotoUrl"
      :alt="routine.userNickname"
      class="h-8 w-8 shrink-0 rounded-full object-cover"
    >
    <div
      v-else
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forge-surfaceAlt text-xs font-semibold text-forge-textSec"
    >
      {{ routine.userNickname.slice(0, 2).toUpperCase() }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-forge-text">{{ routine.userNickname }}</p>
      <p class="truncate text-xs text-forge-muted">{{ routine.name }}</p>
    </div>

    <span class="shrink-0 text-xs text-forge-muted">{{ routine.likesCount }} likes · {{ routine.commentsCount }} comentarios</span>
    <span class="shrink-0 text-xs text-forge-muted">
      {{ routine.createdAt ? routine.createdAt.toLocaleDateString('es-ES') : '—' }}
    </span>

    <button
      type="button"
      class="shrink-0 rounded p-2 text-forge-textSec hover:bg-forge-danger/10 hover:text-forge-danger"
      aria-label="Eliminar"
      @click="emit('delete')"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</template>
```

- [ ] **Step 3**: `app/pages/cms/moderacion/index.vue`

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCmsModerationStore } from '~/stores/cms/moderation.store'
import PostModerationRow from '~/components/cms/moderation/PostModerationRow.vue'
import RoutineModerationRow from '~/components/cms/moderation/RoutineModerationRow.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const moderationStore = useCmsModerationStore()

const activeTab = ref<'posts' | 'routines'>('posts')

const showConfirm = ref(false)
const deleting = ref(false)
const pendingDelete = ref<{ type: 'post' | 'routine'; id: string; label: string } | null>(null)

onMounted(() => {
  moderationStore.fetchPosts()
  moderationStore.fetchRoutines()
})

function askDeletePost(id: string, label: string) {
  pendingDelete.value = { type: 'post', id, label }
  showConfirm.value = true
}

function askDeleteRoutine(id: string, label: string) {
  pendingDelete.value = { type: 'routine', id, label }
  showConfirm.value = true
}

async function handleConfirm() {
  if (!pendingDelete.value) return
  deleting.value = true
  if (pendingDelete.value.type === 'post') {
    await moderationStore.removePost(pendingDelete.value.id)
  } else {
    await moderationStore.removeRoutine(pendingDelete.value.id)
  }
  deleting.value = false
  showConfirm.value = false
  pendingDelete.value = null
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-forge-text">Moderación</h1>

    <div class="mb-4 flex gap-2 border-b border-forge-divider">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium"
        :class="activeTab === 'posts' ? 'border-b-2 border-forge-primary text-forge-primary' : 'text-forge-muted'"
        @click="activeTab = 'posts'"
      >
        Posts
      </button>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium"
        :class="activeTab === 'routines' ? 'border-b-2 border-forge-primary text-forge-primary' : 'text-forge-muted'"
        @click="activeTab = 'routines'"
      >
        Rutinas públicas
      </button>
    </div>

    <template v-if="activeTab === 'posts'">
      <EmptyState
        v-if="moderationStore.postsError"
        title="No se pudieron cargar los posts"
        :description="moderationStore.postsError"
      />
      <div v-else-if="moderationStore.postsLoading" class="text-sm text-forge-muted">
        Cargando…
      </div>
      <EmptyState
        v-else-if="moderationStore.posts.length === 0"
        title="No hay posts que mostrar"
      />
      <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
        <PostModerationRow
          v-for="post in moderationStore.posts"
          :key="post.id"
          :post="post"
          @delete="askDeletePost(post.id, post.workoutName)"
        />
      </div>
    </template>

    <template v-else>
      <EmptyState
        v-if="moderationStore.routinesError"
        title="No se pudieron cargar las rutinas"
        :description="moderationStore.routinesError"
      />
      <div v-else-if="moderationStore.routinesLoading" class="text-sm text-forge-muted">
        Cargando…
      </div>
      <EmptyState
        v-else-if="moderationStore.routines.length === 0"
        title="No hay rutinas públicas que mostrar"
      />
      <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
        <RoutineModerationRow
          v-for="routine in moderationStore.routines"
          :key="routine.id"
          :routine="routine"
          @delete="askDeleteRoutine(routine.id, routine.name)"
        />
      </div>
    </template>

    <ConfirmModal
      :open="showConfirm"
      title="Eliminar contenido"
      :message="`¿Seguro que quieres eliminar «${pendingDelete?.label ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>
```

- [ ] **Step 4**: Activar "Moderación" en el sidebar. En
`app/components/cms/layout/CmsSidebar.vue`, quitar "Moderación" de
`comingSoon`:

```typescript
const comingSoon = [
  { label: 'Ejercicios', icon: Dumbbell },
  { label: 'Configuración', icon: Settings },
]
```

Y añadir un `NuxtLink` real, después del de "Notificaciones":

```vue
      <NuxtLink
        to="/cms/moderacion"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <ShieldAlert class="h-4 w-4" />
        Moderación
      </NuxtLink>
```

(El import de `ShieldAlert` desde `lucide-vue-next` ya existe en el
archivo.)

- [ ] **Step 5**: Typecheck + `npm run dev` + `curl http://localhost:3000/cms/moderacion` → 200. Matar el proceso dev al terminar.

---

### Task 6: Verificación funcional + commit

**Files:** ninguno nuevo.

- [ ] **Step 1**: `npm run generate`. Expected: sin errores, prerenderiza
`/cms/moderacion`.

- [ ] **Step 2**: Recorrido manual (navegador, `npm run dev`):
1. `/cms/moderacion` → tab "Posts" activo por defecto, lista posts reales
   (o `EmptyState` si no hay ninguno).
2. Cambiar a tab "Rutinas públicas" → lista rutinas reales con
   `visibility: 'public'`.
   - Si aparece un error de Firestore pidiendo crear un índice compuesto:
     seguir el link que Firestore da en el propio mensaje de error para
     crearlo con un clic (flujo estándar, no requiere volver al plan).
3. Eliminar un post de prueba (crear uno desde la app si hace falta, o usar
   uno ya existente de bajo valor) → pide confirmación, tras confirmar
   desaparece de la lista y de Firestore.
4. Repetir con una rutina pública.

- [ ] **Step 3**: Commit.

```bash
git add app/types/cms/moderation.ts app/services/cms/moderation.service.ts app/stores/cms/moderation.store.ts app/components/cms/moderation/ app/pages/cms/moderacion/ app/components/cms/layout/CmsSidebar.vue docs/superpowers/plans/2026-08-08-moderacion.md docs/superpowers/specs/2026-08-08-moderacion-design.md
git commit -m "$(cat <<'EOF'
feat: añadir módulo Moderación al CMS

Listado y eliminación de posts y rutinas públicas recientes. Amplía las
Firestore rules de posts/routines para que el admin pueda borrar
contenido de cualquier usuario (antes solo el propio dueño podía).
EOF
)"
```
