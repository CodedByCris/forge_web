# Ejercicios — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Limpiar `primaryMuscle`/`secondaryMuscles` de los ~1396 documentos de `exercises`, habilitar subida de imagen (Storage rules), y construir `/cms/ejercicios` (listado paginado + filtros) y `/cms/ejercicios/[id]` (edición completa + imagen), más el cambio mínimo en Flutter para mostrar la imagen.

**Architecture:** CMS — mismo patrón `services → stores → components/pages`, con paginación cursor-based (a diferencia de los módulos anteriores, por volumen). Flutter — cambio localizado de un solo widget, sin tocar arquitectura.

**Tech Stack:** Nuxt 4/Pinia/Firebase JS SDK (Firestore + Storage). Flutter (`Image.network`, ya con `imageUrl` soportado en el modelo). Cero dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-08-08-ejercicios-design.md`

---

## Nota sobre este plan

- Commits en `forge_web`: autorizados, uno al final de la sección CMS
  (Task 10). Commits en `forge` (Storage rules, Flutter): no autorizados.
- Deploy de Storage rules: autorizado sin pausa de confirmación adicional
  (mismo criterio que planes anteriores) — dry-run primero.
- **Task 1 (limpieza de datos) requiere confirmación explícita del usuario
  antes de ejecutar el borrado masivo** — no es un deploy de reglas, es una
  escritura irreversible sobre ~1396 documentos de producción.
- Sin tests.

---

### Task 1: Limpieza — borrar `primaryMuscle`/`secondaryMuscles`

**Requiere confirmación explícita del usuario antes de ejecutar el borrado
real.** Se hace primero un conteo de cuántos documentos serían afectados
(solo lectura), se muestra al usuario, y solo se borra tras su confirmación.

**Files:** ninguno del repo — script temporal en el scratchpad, se borra al
terminar.

- [ ] **Step 1**: Escribir un script temporal (mismo mecanismo REST +
credenciales OAuth ya usado en este proyecto para FAQ/Legal) que:
  1. Lista todos los documentos de `exercises` (paginado internamente, la
     REST API de Firestore limita resultados por página).
  2. Cuenta cuántos tienen `primaryMuscle` o `secondaryMuscles` presentes.
  3. Imprime el conteo y se detiene (no borra todavía).

- [ ] **Step 2**: Ejecutar en modo solo-conteo. Reportar el número exacto
al usuario y **esperar confirmación explícita** antes de continuar.

- [ ] **Step 3** (solo tras confirmación): Ampliar el script para, por cada
documento con esos campos, hacer un `PATCH` con
`updateMask.fieldPaths=primaryMuscle&updateMask.fieldPaths=secondaryMuscles`
y body vacío (equivalente a `FieldValue.delete()` en ambos campos vía REST
— un `updateMask` que referencia un campo no presente en `fields` lo
borra). Ejecutar contra todos los documentos afectados.

- [ ] **Step 4**: Verificar con una relectura de una muestra (5-10 docs)
que los campos ya no existen. Borrar el script temporal del scratchpad.

---

### Task 2: Storage rules — habilitar subida admin + deploy

**Files:**
- Modify: `/Users/cris/Desktop/forge/storage.rules`

- [ ] **Step 1**: Cambiar el bloque `match /exercises/{slug}/{fileName}`
de:
```javascript
    match /exercises/{slug}/{fileName} {
      allow read: if true;
      allow write: if false;
    }
```
a:
```javascript
    match /exercises/{slug}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true &&
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
```

- [ ] **Step 2**: Confirmar que no se tocó nada más del archivo (`git diff
storage.rules` debe mostrar solo este bloque).

- [ ] **Step 3**: Dry-run + deploy.
```bash
cd /Users/cris/Desktop/forge
firebase deploy --only storage --dry-run
firebase deploy --only storage
```
Expected: ambos sin errores, el segundo termina en `Deploy complete!`.

- [ ] **Step 4**: Verificar con una subida de prueba real desde el CMS en
la Task 10 (no hay forma práctica de probar Storage rules vía REST simple
como con Firestore — se verifica en el flujo real).

---

### Task 3: Tipos CMS

**Files:**
- Create: `app/types/cms/exercise.ts`

- [ ] **Step 1**:

```typescript
// app/types/cms/exercise.ts
export type CmsExerciseType = 'std' | 'ab' | 'tim' | 'tyd'

export const EXERCISE_TYPE_LABELS: Record<CmsExerciseType, string> = {
  std: 'Estándar',
  ab: 'Asistido',
  tim: 'Tiempo',
  tyd: 'Tiempo y distancia',
}

export const BODY_PARTS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'glutes', 'quads', 'hamstrings', 'adductors', 'abductors',
  'calves', 'cardio', 'neck', 'other',
] as const

export type CmsBodyPart = typeof BODY_PARTS[number]

export interface CmsExercise {
  id: string
  name: string
  bodyParts: string[]
  exerciseType: CmsExerciseType
  isActive: boolean
  instructionSteps: string[]
  equipment: string | null
  category: string | null
  imageUrl: string | null
}
```

- [ ] **Step 2**: Typecheck (`npx vue-tsc --noEmit --project .nuxt/tsconfig.json`,
`npx nuxi prepare` antes si hace falta). Sin errores nuevos.

---

### Task 4: Servicio `exercises.service.ts`

**Files:**
- Create: `app/services/cms/exercises.service.ts`

- [ ] **Step 1**:

```typescript
// app/services/cms/exercises.service.ts
import {
  getFirestore,
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import type { CmsExercise, CmsExerciseType } from '~/types/cms/exercise'

function toExercise(id: string, data: DocumentData): CmsExercise {
  return {
    id,
    name: data.name ?? '',
    bodyParts: data.bodyParts ?? [],
    exerciseType: (data.exerciseType ?? 'std') as CmsExerciseType,
    isActive: data.isActive === true,
    instructionSteps: data.instructionSteps ?? [],
    equipment: data.equipment ?? null,
    category: data.category ?? null,
    imageUrl: data.imageUrl ?? null,
  }
}

export interface ExercisesPage {
  exercises: CmsExercise[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export async function getExercisesPage(
  cursor: QueryDocumentSnapshot<DocumentData> | null,
  pageSize = 25,
): Promise<ExercisesPage> {
  const db = getFirestore()
  let q = query(collection(db, 'exercises'), orderBy('name'), limit(pageSize))
  if (cursor) {
    q = query(collection(db, 'exercises'), orderBy('name'), startAfter(cursor), limit(pageSize))
  }
  const snap = await getDocs(q)
  return {
    exercises: snap.docs.map((d) => toExercise(d.id, d.data())),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === pageSize,
  }
}

export async function searchExercisesByName(term: string, pageSize = 25): Promise<CmsExercise[]> {
  const db = getFirestore()
  const q = query(
    collection(db, 'exercises'),
    orderBy('name'),
    where('name', '>=', term),
    where('name', '<=', term + ''),
    limit(pageSize),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => toExercise(d.id, d.data()))
}

export async function getExercise(id: string): Promise<CmsExercise | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'exercises', id))
  if (!snap.exists()) return null
  return toExercise(snap.id, snap.data())
}

export async function updateExercise(id: string, data: Partial<Omit<CmsExercise, 'id'>>): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'exercises', id), data)
}

export async function uploadExerciseImage(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises/${id}/photo.jpg`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  return getDownloadURL(fileRef)
}
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

**Nota**: la búsqueda por nombre (`searchExercisesByName`) es prefix-match,
no full-text — documentado ya en el spec, no es un bug si "contiene" no
encuentra resultados que sí "empiezan con" el término.

---

### Task 5: Store `exercises.store.ts`

**Files:**
- Create: `app/stores/cms/exercises.store.ts`

- [ ] **Step 1**:

```typescript
// app/stores/cms/exercises.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import type { CmsExercise } from '~/types/cms/exercise'
import {
  getExercisesPage,
  searchExercisesByName,
  getExercise,
  updateExercise,
  uploadExerciseImage,
} from '~/services/cms/exercises.service'

export const useCmsExercisesStore = defineStore('cmsExercises', () => {
  const exercises = ref<CmsExercise[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cursor = ref<QueryDocumentSnapshot<DocumentData> | null>(null)
  const hasMore = ref(true)
  const searchTerm = ref('')

  const selected = ref<CmsExercise | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchFirstPage(): Promise<void> {
    loading.value = true
    error.value = null
    cursor.value = null
    try {
      if (searchTerm.value.trim()) {
        exercises.value = await searchExercisesByName(searchTerm.value.trim())
        hasMore.value = false
      } else {
        const page = await getExercisesPage(null)
        exercises.value = page.exercises
        cursor.value = page.lastDoc
        hasMore.value = page.hasMore
      }
    } catch {
      error.value = 'No se pudieron cargar los ejercicios.'
    } finally {
      loading.value = false
    }
  }

  async function fetchNextPage(): Promise<void> {
    if (!hasMore.value || loading.value || searchTerm.value.trim()) return
    loading.value = true
    try {
      const page = await getExercisesPage(cursor.value)
      exercises.value = [...exercises.value, ...page.exercises]
      cursor.value = page.lastDoc
      hasMore.value = page.hasMore
    } catch {
      error.value = 'No se pudieron cargar más ejercicios.'
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: string): Promise<void> {
    detailLoading.value = true
    detailError.value = null
    try {
      selected.value = await getExercise(id)
      if (!selected.value) detailError.value = 'Ejercicio no encontrado.'
    } catch {
      detailError.value = 'No se pudo cargar el ejercicio.'
    } finally {
      detailLoading.value = false
    }
  }

  async function saveDetail(
    id: string,
    data: Partial<Omit<CmsExercise, 'id'>>,
    imageFile: File | null,
  ): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      let imageUrl = data.imageUrl
      if (imageFile) {
        imageUrl = await uploadExerciseImage(id, imageFile)
      }
      await updateExercise(id, { ...data, ...(imageFile ? { imageUrl } : {}) })
      if (selected.value) {
        selected.value = { ...selected.value, ...data, ...(imageFile ? { imageUrl: imageUrl! } : {}) }
      }
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar el ejercicio.'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    exercises,
    loading,
    error,
    hasMore,
    searchTerm,
    selected,
    detailLoading,
    detailError,
    saving,
    saveError,
    fetchFirstPage,
    fetchNextPage,
    fetchDetail,
    saveDetail,
  }
})
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

---

### Task 6: Componente `ExerciseRow.vue`

**Files:**
- Create: `app/components/cms/exercises/ExerciseRow.vue`

- [ ] **Step 1**:

```vue
<script setup lang="ts">
import type { CmsExercise } from '~/types/cms/exercise'
import { EXERCISE_TYPE_LABELS } from '~/types/cms/exercise'

defineProps<{
  exercise: CmsExercise
}>()
</script>

<template>
  <NuxtLink
    :to="`/cms/ejercicios/${exercise.id}`"
    class="flex items-center gap-4 border-b border-forge-divider px-4 py-3 text-sm hover:bg-forge-surfaceAlt"
  >
    <img
      v-if="exercise.imageUrl"
      :src="exercise.imageUrl"
      :alt="exercise.name"
      class="h-10 w-10 shrink-0 rounded-lg object-cover"
    >
    <div
      v-else
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forge-surfaceAlt text-xs text-forge-muted"
    >
      —
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-forge-text">{{ exercise.name }}</p>
      <p class="truncate text-xs text-forge-muted">
        {{ exercise.bodyParts.join(', ') || '—' }}
      </p>
    </div>

    <span class="shrink-0 text-xs text-forge-muted">{{ EXERCISE_TYPE_LABELS[exercise.exerciseType] }}</span>

    <span
      class="shrink-0 rounded px-2 py-1 text-[10px] uppercase tracking-wide"
      :class="exercise.isActive ? 'bg-forge-success/10 text-forge-success' : 'bg-forge-surfaceAlt text-forge-muted'"
    >
      {{ exercise.isActive ? 'Activo' : 'Inactivo' }}
    </span>
  </NuxtLink>
</template>
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

---

### Task 7: Página listado `/cms/ejercicios`

**Files:**
- Create: `app/pages/cms/ejercicios/index.vue`

- [ ] **Step 1**:

```vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCmsExercisesStore } from '~/stores/cms/exercises.store'
import ExerciseRow from '~/components/cms/exercises/ExerciseRow.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import { BODY_PARTS, EXERCISE_TYPE_LABELS, type CmsExerciseType } from '~/types/cms/exercise'

definePageMeta({ layout: 'cms' })

const exercisesStore = useCmsExercisesStore()

const bodyPartFilter = ref<string>('')
const exerciseTypeFilter = ref<CmsExerciseType | ''>('')
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')

onMounted(() => {
  exercisesStore.fetchFirstPage()
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(() => exercisesStore.searchTerm, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    exercisesStore.fetchFirstPage()
  }, 300)
})

// Los filtros se aplican en cliente sobre la página ya cargada — Firestore
// no permite combinar un where('name', '>=', ...) de rango con más filtros
// de igualdad en la misma query sin índices compuestos adicionales. Ver
// nota de la limitación en el spec.
const filteredExercises = computed(() => {
  return exercisesStore.exercises.filter((ex) => {
    if (bodyPartFilter.value && !ex.bodyParts.includes(bodyPartFilter.value)) return false
    if (exerciseTypeFilter.value && ex.exerciseType !== exerciseTypeFilter.value) return false
    if (activeFilter.value === 'active' && !ex.isActive) return false
    if (activeFilter.value === 'inactive' && ex.isActive) return false
    return true
  })
})
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-forge-text">Ejercicios</h1>
      <div class="flex flex-wrap gap-2">
        <select
          v-model="bodyPartFilter"
          class="rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
          <option value="">Todos los grupos</option>
          <option v-for="part in BODY_PARTS" :key="part" :value="part">{{ part }}</option>
        </select>
        <select
          v-model="exerciseTypeFilter"
          class="rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
          <option value="">Todos los tipos</option>
          <option v-for="(label, key) in EXERCISE_TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
        <select
          v-model="activeFilter"
          class="rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <input
          v-model="exercisesStore.searchTerm"
          type="text"
          placeholder="Buscar por nombre (empieza por…)"
          class="w-56 rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
      </div>
    </div>

    <EmptyState
      v-if="exercisesStore.error"
      title="No se pudieron cargar los ejercicios"
      :description="exercisesStore.error"
    />

    <div v-else-if="exercisesStore.loading && exercisesStore.exercises.length === 0" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="filteredExercises.length === 0"
      title="Sin resultados"
    />

    <div v-else>
      <div class="overflow-hidden rounded-xl border border-forge-divider">
        <ExerciseRow
          v-for="exercise in filteredExercises"
          :key="exercise.id"
          :exercise="exercise"
        />
      </div>

      <p v-if="(bodyPartFilter || exerciseTypeFilter || activeFilter !== 'all') && exercisesStore.hasMore" class="mt-2 text-xs text-forge-muted">
        Los filtros solo se aplican sobre las páginas ya cargadas — pulsa
        "Cargar más" si buscas un ejercicio que no aparece.
      </p>

      <button
        v-if="exercisesStore.hasMore"
        type="button"
        :disabled="exercisesStore.loading"
        class="mt-4 w-full rounded-lg border border-forge-divider py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt disabled:opacity-60"
        @click="exercisesStore.fetchNextPage"
      >
        {{ exercisesStore.loading ? 'Cargando…' : 'Cargar más' }}
      </button>
    </div>
  </div>
</template>
```

**Nota de diseño**: los filtros de `bodyPartFilter`/`exerciseTypeFilter`/
`activeFilter` se aplican en cliente sobre las páginas ya cargadas de
Firestore, no como `where` adicionales en la query — combinarlos con la
búsqueda por nombre (que ya usa un `where` de rango) requeriría índices
compuestos por cada combinación de filtro+búsqueda, desproporcionado para
este caso de uso. El aviso in-UI dentro del `v-if` de arriba deja esto
explícito al usuario en vez de que parezca "no encontrado" silenciosamente.

- [ ] **Step 2**: Typecheck + `npm run dev` + `curl http://localhost:3000/cms/ejercicios` → 200. Matar el proceso dev al terminar.

---

### Task 8: Página detalle `/cms/ejercicios/[id]`

**Files:**
- Create: `app/pages/cms/ejercicios/[id].vue`

- [ ] **Step 1**:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCmsExercisesStore } from '~/stores/cms/exercises.store'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import { BODY_PARTS, EXERCISE_TYPE_LABELS, type CmsExerciseType } from '~/types/cms/exercise'

definePageMeta({ layout: 'cms' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const exercisesStore = useCmsExercisesStore()

const name = ref('')
const bodyParts = ref<string[]>([])
const exerciseType = ref<CmsExerciseType>('std')
const isActive = ref(true)
const instructionStepsText = ref('')
const equipment = ref('')
const category = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const saved = ref(false)

onMounted(async () => {
  await exercisesStore.fetchDetail(id.value)
  const ex = exercisesStore.selected
  if (ex) {
    name.value = ex.name
    bodyParts.value = [...ex.bodyParts]
    exerciseType.value = ex.exerciseType
    isActive.value = ex.isActive
    instructionStepsText.value = ex.instructionSteps.join('\n')
    equipment.value = ex.equipment ?? ''
    category.value = ex.category ?? ''
    imagePreview.value = ex.imageUrl
  }
})

function toggleBodyPart(part: string) {
  if (bodyParts.value.includes(part)) {
    bodyParts.value = bodyParts.value.filter((p) => p !== part)
  } else {
    bodyParts.value = [...bodyParts.value, part]
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  imageFile.value = file
  if (file) {
    imagePreview.value = URL.createObjectURL(file)
  }
}

async function handleSave() {
  saved.value = false
  const ok = await exercisesStore.saveDetail(
    id.value,
    {
      name: name.value.trim(),
      bodyParts: bodyParts.value,
      exerciseType: exerciseType.value,
      isActive: isActive.value,
      instructionSteps: instructionStepsText.value.split('\n').map((s) => s.trim()).filter(Boolean),
      equipment: equipment.value.trim() || null,
      category: category.value.trim() || null,
    },
    imageFile.value,
  )
  if (ok) {
    saved.value = true
    imageFile.value = null
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <EmptyState
      v-if="exercisesStore.detailError"
      title="No se pudo cargar el ejercicio"
      :description="exercisesStore.detailError"
    />

    <div v-else-if="exercisesStore.detailLoading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <template v-else-if="exercisesStore.selected">
      <h1 class="mb-6 text-xl font-bold text-forge-text">Editar ejercicio</h1>

      <div class="space-y-4">
        <div>
          <label for="ex-name" class="mb-1.5 block text-xs font-medium text-forge-textSec">Nombre</label>
          <input
            id="ex-name"
            v-model="name"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Grupos musculares</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="part in BODY_PARTS"
              :key="part"
              type="button"
              class="rounded px-2 py-1 text-xs"
              :class="bodyParts.includes(part) ? 'bg-forge-primary/10 text-forge-primary' : 'bg-forge-surfaceAlt text-forge-muted'"
              @click="toggleBodyPart(part)"
            >
              {{ part }}
            </button>
          </div>
        </div>

        <div>
          <label for="ex-type" class="mb-1.5 block text-xs font-medium text-forge-textSec">Tipo de ejercicio</label>
          <select
            id="ex-type"
            v-model="exerciseType"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
            <option v-for="(label, key) in EXERCISE_TYPE_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <input id="ex-active" v-model="isActive" type="checkbox" class="h-4 w-4">
          <label for="ex-active" class="text-sm text-forge-textSec">Activo</label>
        </div>

        <div>
          <label for="ex-equipment" class="mb-1.5 block text-xs font-medium text-forge-textSec">Equipamiento</label>
          <input
            id="ex-equipment"
            v-model="equipment"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>

        <div>
          <label for="ex-category" class="mb-1.5 block text-xs font-medium text-forge-textSec">Categoría</label>
          <input
            id="ex-category"
            v-model="category"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>

        <div>
          <label for="ex-steps" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Instrucciones (un paso por línea)
          </label>
          <textarea
            id="ex-steps"
            v-model="instructionStepsText"
            rows="5"
            class="w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Imagen</label>
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="Preview"
            class="mb-2 h-32 w-32 rounded-lg object-cover"
          >
          <input type="file" accept="image/*" @change="handleFileChange">
        </div>

        <p v-if="exercisesStore.saveError" class="text-sm text-forge-danger">
          {{ exercisesStore.saveError }}
        </p>
        <p v-if="saved" class="text-sm text-forge-success">
          Guardado. Recuerda
          <NuxtLink to="/cms/configuracion" class="underline">
            actualizar la caché de ejercicios
          </NuxtLink>
          para que se vea en los dispositivos.
        </p>

        <button
          type="button"
          :disabled="exercisesStore.saving || !name.trim()"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSave"
        >
          {{ exercisesStore.saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2**: Typecheck + `npm run dev` + `curl http://localhost:3000/cms/ejercicios/test-id` → 200. Matar el proceso dev al terminar.

---

### Task 9: Activar "Ejercicios" en el sidebar

**Files:**
- Modify: `app/components/cms/layout/CmsSidebar.vue`

- [ ] **Step 1**: Quitar "Ejercicios" del array `comingSoon` (queda
vacío — todos los módulos planeados ya están activos):

```typescript
const comingSoon: never[] = []
```

Y añadir un `NuxtLink` real, después del de "Configuración":

```vue
      <NuxtLink
        to="/cms/ejercicios"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <Dumbbell class="h-4 w-4" />
        Ejercicios
      </NuxtLink>
```

(El import de `Dumbbell` desde `lucide-vue-next` ya existe en el archivo.)

- [ ] **Step 2**: Con `comingSoon` vacío, el `<div v-for="item in
comingSoon">` no renderiza nada — esto es correcto y no requiere quitar el
bloque `v-for` del template (deja el código preparado para si se añade otro
módulo "próximamente" en el futuro).

- [ ] **Step 3**: Typecheck + `npm run dev` + `curl http://localhost:3000/cms` → 200. Matar el proceso dev al terminar.

---

### Task 10: Verificación funcional + commit

**Files:** ninguno nuevo.

- [ ] **Step 1**: `npm run generate`. Expected: sin errores, prerenderiza
`/cms/ejercicios` (la ruta dinámica `[id]` no se prerenderiza sin un ID
conocido — esperado, cubierta por `ssr:false`).

- [ ] **Step 2**: Recorrido manual (navegador, `npm run dev`):
1. `/cms/ejercicios` → lista real (primeros 25 por nombre), "Cargar más"
   trae la siguiente página.
2. Buscar un ejercicio por nombre (prefix) → resultados correctos.
3. Click en un ejercicio → detalle con todos los campos precargados.
4. Editar `name`, `bodyParts`, `exerciseType`, `isActive`,
   `instructionSteps`, `equipment`, `category` → guardar → confirmar en
   Firestore que se actualizó.
5. Subir una imagen de prueba → guardar → confirmar que `imageUrl` se
   guardó y la imagen es accesible públicamente (abrir la URL en el
   navegador).
6. Confirmar que el mensaje de "recuerda actualizar la caché" aparece y el
   link a `/cms/configuracion` funciona.

- [ ] **Step 3**: Commit.

```bash
git add app/types/cms/exercise.ts app/services/cms/exercises.service.ts app/stores/cms/exercises.store.ts app/components/cms/exercises/ app/pages/cms/ejercicios/ app/components/cms/layout/CmsSidebar.vue docs/superpowers/plans/2026-08-08-ejercicios.md docs/superpowers/specs/2026-08-08-ejercicios-design.md
git commit -m "$(cat <<'EOF'
feat: añadir módulo Ejercicios al CMS

Listado paginado (~1396 ejercicios) con búsqueda por nombre, edición
completa (nombre, grupos musculares, tipo, activo, instrucciones,
equipamiento, categoría) y subida de imagen a Storage. Habilita
escritura admin en storage.rules para exercises/{slug}/{fileName}.
EOF
)"
```

---

### Task 11: App móvil — mostrar imagen en `ExercisePickerItem`

**Files:**
- Modify: `/Users/cris/Desktop/forge/lib/features/exercises/presentation/widgets/exercise_picker_item.dart:57-65`

- [ ] **Step 1**: Reemplazar el `Container` de 40×40 (líneas 57-65
actuales) por una versión que muestre la imagen si existe:

```dart
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: exercise.imageUrl != null
                      ? Image.network(
                          exercise.imageUrl!,
                          width: 40,
                          height: 40,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 40,
                            height: 40,
                            color: primary.color.withValues(alpha: 0.15),
                            child: Icon(primary.icon, color: primary.color, size: 20),
                          ),
                        )
                      : Container(
                          width: 40,
                          height: 40,
                          color: primary.color.withValues(alpha: 0.15),
                          child: Icon(primary.icon, color: primary.color, size: 20),
                        ),
                ),
```

- [ ] **Step 2**: `flutter analyze
lib/features/exercises/presentation/widgets/exercise_picker_item.dart`.
Expected: sin errores nuevos.

---

### Task 12: Verificación final Flutter

**Files:** ninguno — solo verificación.

- [ ] **Step 1**: `flutter analyze` completo desde `/Users/cris/Desktop/forge`.
Expected: sin errores nuevos (23 issues preexistentes ajenos ya
documentados en planes anteriores no cuentan).

- [ ] **Step 2**: Recorrido manual (`flutter run`, dispositivo/emulador,
con al menos una imagen ya subida desde el CMS en la Task 10): abrir el
selector de ejercicios → el ejercicio con imagen la muestra en miniatura;
el resto sigue mostrando el icono de grupo muscular de siempre, sin
romperse.

No se crea ningún commit en `forge`.
