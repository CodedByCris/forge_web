# Novedades — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el carrusel de bienvenida hardcodeado (`introduction_screen.dart`) por una pantalla "Novedades" gestionada desde el CMS (`forge_web`), que se muestra a usuarios nuevos y existentes, con reaparición forzable por un admin y un ajuste manual en Settings.

**Architecture:** Colección Firestore `whats_new_items` + campo `whatsNewVersion` en `config/appConfig`, gestionados desde un módulo CRUD nuevo en `/cms/novedades` (Nuxt/Pinia, mismo patrón que Ejercicios/FAQ). En `forge` (Flutter), un feature nuevo `whats_new` (Clean Architecture + Riverpod, mismo patrón que `faq`) lee esa colección; el disparo vive en `MainShell` (raíz post-login), comparando la versión remota con una versión vista guardada en `SharedPreferences`.

**Tech Stack:** Nuxt 3 / Vue 3 / Pinia / Firebase JS SDK (`forge_web`); Flutter / Riverpod / `cloud_firestore` (`forge`).

---

## Notas de proceso (leer antes de empezar)

- **Sin tests.** Ninguno de los dos repos usa tests (regla explícita en `forge_web/.claude/CLAUDE.md`, confirmada también para `forge` en la spec). Los pasos de verificación de cada tarea son type-check/`flutter analyze`/comprobación manual, no tests automatizados.
- **Sin commits automáticos.** `forge_web/.claude/CLAUDE.md` prohíbe explícitamente hacer commits sin que lo pida el usuario — **ninguna tarea de este plan incluye un paso de `git commit`**. Todo el trabajo queda en el working tree de cada repo; el usuario decide cuándo y qué commitear.
- **Dos repos.** Las tareas 1-3 tocan `/Users/cris/Desktop/forge` (rules + docs), las tareas 4-11 tocan `/Users/cris/Desktop/forge_web` (CMS), las tareas 12-21 vuelven a `/Users/cris/Desktop/forge` (Flutter). Todas las rutas de archivo son absolutas o relativas a uno de esos dos repos — se indica cuál en cada tarea.
- **No desplegar rules automáticamente.** La tarea 1 solo edita `firestore.rules` en el working tree. Desplegar (`firebase deploy --only firestore:rules`) es una acción sobre infraestructura compartida en producción — queda en la tarea manual final (Tarea 22) para que la ejecute el usuario explícitamente.
- Spec completa: `docs/superpowers/specs/2026-08-09-novedades-design.md` (este repo, `forge_web`).

---

## Fase A — Backend compartido (repo `forge`)

### Task 1: Firestore rules — colección `whats_new_items`

**Files:**
- Modify: `/Users/cris/Desktop/forge/firestore.rules:247-251`

- [ ] **Step 1: Añadir el bloque de reglas**

Justo después del bloque `match /config/{docId}` (líneas 248-251) y antes del comentario `// Cualquier otra colección...` (línea ~253), insertar:

```javascript
    // ── Novedades (gestionado desde el CMS forge_web) ──────────────────────
    match /whats_new_items/{itemId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

```

El bloque `config/{docId}` completo queda así (sin cambios en él, solo referencia para ubicar el punto de inserción):

```javascript
    // ── Config remota (gestionado desde el CMS forge_web) ──────────────────
    match /config/{docId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // ── Novedades (gestionado desde el CMS forge_web) ──────────────────────
    match /whats_new_items/{itemId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // Cualquier otra colección (ai_routines, ranked_sessions,
```

- [ ] **Step 2: Verificar sintaxis**

Run: `cd /Users/cris/Desktop/forge && firebase deploy --only firestore:rules --dry-run`
Expected: sin errores de sintaxis (el comando valida las rules sin desplegar). Si `firebase` no está autenticado en este entorno, al menos revisar visualmente que las llaves/paréntesis cierran correctamente y que seguiste la indentación de los bloques vecinos.

---

### Task 2: Documentar en `forge/.claude/BACKEND.md`

**Files:**
- Modify: `/Users/cris/Desktop/forge/.claude/BACKEND.md`

- [ ] **Step 1: Añadir el campo nuevo al bloque de `APP CONFIG` (línea 754-762)**

Reemplazar:

```markdown
## APP CONFIG ✅

### Document: `config/appConfig`

```json
{
  "exercisesCacheKey": "string — cambiar para invalidar caché de ejercicios en todos los dispositivos"
}
```

> Flujo: arranque → lee key remota → compara con key local (`SharedPreferences`) → si difiere, descarta caché y refetch.

---
```

por:

```markdown
## APP CONFIG ✅

### Document: `config/appConfig`

```json
{
  "exercisesCacheKey": "string — cambiar para invalidar caché de ejercicios en todos los dispositivos",
  "whatsNewVersion": "number — incrementar para forzar que todos los usuarios vuelvan a ver las Novedades"
}
```

> Flujo `exercisesCacheKey`: arranque → lee key remota → compara con key local (`SharedPreferences`) → si difiere, descarta caché y refetch.
> Flujo `whatsNewVersion`: ver sección NOVEDADES más abajo.

---

## NOVEDADES ✅

### Collection: `whats_new_items`

Pantallas del carrusel "Novedades" (título + descripción + imagen opcional), gestionadas desde `/cms/novedades`. Se muestran a usuarios nuevos al entrar por primera vez y a usuarios existentes cuando un admin fuerza la reaparición (bump de `config/appConfig.whatsNewVersion`).

```json
{
  "id": "string — doc ID",
  "title": "string",
  "description": "string",
  "imageUrl": "string | null",
  "order": "number — Date.now() al crear; editable con mover arriba/abajo desde el CMS",
  "isActive": "boolean — false = oculta del carrusel",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

> Query cliente: `where('isActive', ==, true).orderBy('order')`.
> Sin vídeo (solo imagen) e implementado como lista única vigente, sin historial de tandas.
> El cliente Flutter compara `config/appConfig.whatsNewVersion` (remoto) contra `whatsNewSeenVersion` (`SharedPreferences`, local); si remoto > local, muestra el carrusel. Cubre a la vez "primera vez" (local inexistente = 0) y "forzado por admin".

---
```

- [ ] **Step 2: Añadir fila a la tabla `## ESTADO DE FEATURES` (línea ~799)**

Después de la fila `| Tienda | ... |`, añadir:

```markdown
| Novedades | `whats_new_items` | ✅ Implementado |
```

- [ ] **Step 3: Actualizar la sección `## SEGURIDAD` (líneas 809 y 821)**

En "### Patrón general" (línea 809), la frase:

```markdown
- Lectura de `users`, `exercises`, `posts`, `routines`, `follows`, `workout_duels`, `shop_items`, `shop_collections`, `config`: cualquier usuario **autenticado** (requerido por las pantallas sociales/búsqueda/feed que leen docs de otros usuarios).
```

pasa a:

```markdown
- Lectura de `users`, `exercises`, `posts`, `routines`, `follows`, `workout_duels`, `shop_items`, `shop_collections`, `config`, `whats_new_items`: cualquier usuario **autenticado** (requerido por las pantallas sociales/búsqueda/feed que leen docs de otros usuarios).
```

En "### Admin (CMS `forge_web`)" (línea 821), la frase:

```markdown
- `exercises`, `shop_items`, `shop_collections`, `config`: lectura para cualquier autenticado, **escritura solo si `isAdmin()`** (helper que hace `get()` sobre `users/{request.auth.uid}.isAdmin`). El CMS gestiona estas colecciones directamente desde el cliente (Firestore SDK del navegador, sin backend propio) — confirmado que hoy `forge_web` no escribe en ninguna de ellas todavía (CMS es un shell vacío), pero cuando se construyan esos módulos (ejercicios, tienda) funcionarán con esta regla sin cambios.
```

pasa a:

```markdown
- `exercises`, `shop_items`, `shop_collections`, `config`, `whats_new_items`: lectura para cualquier autenticado, **escritura solo si `isAdmin()`** (helper que hace `get()` sobre `users/{request.auth.uid}.isAdmin`). El CMS gestiona estas colecciones directamente desde el cliente (Firestore SDK del navegador, sin backend propio).
```

- [ ] **Step 4: Verificar**

Leer el archivo completo tras los cambios (`sed -n '750,835p' /Users/cris/Desktop/forge/.claude/BACKEND.md`) y confirmar que no quedan bloques de código markdown mal cerrados (los ` ``` ` deben seguir alternando correctamente).

---

### Task 3: Documentar en `forge_web/.claude/BACKEND.md`

**Files:**
- Modify: `/Users/cris/Desktop/forge_web/.claude/BACKEND.md`

- [ ] **Step 1: Añadir sección de la colección**

Después de la sección `### \`exercises\` (colección global)` (línea 262-278) y antes de `## Patrones Firestore para web` (línea 280), insertar:

```markdown
### `whats_new_items` (colección global)

```typescript
{
  id: string
  title: string
  description: string
  imageUrl: string | null
  order: number
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}
```

> Gestionada desde `/cms/novedades`. `config/appConfig.whatsNewVersion` (number) se incrementa desde esa misma página ("Forzar reaparición") para que todos los usuarios vuelvan a ver el carrusel.

---
```

- [ ] **Step 2: Actualizar la sección SEGURIDAD (línea 379-380)**

La frase:

```markdown
- **Lectura**: `users`, `exercises`, `shop_items`, `shop_collections`, `config` — cualquier usuario autenticado (Firebase Auth). El login de `/cms` usa el mismo Firebase Auth del proyecto, así que la lectura de `auth.store.ts` (`getDoc(doc(db, 'users', uid))` para comprobar `isAdmin`) sigue funcionando sin cambios.
- **Escritura de `exercises`, `shop_items`, `shop_collections`, `config`**: ahora requiere que el usuario autenticado tenga `users/{uid}.isAdmin == true` (regla `isAdmin()` en `firestore.rules`, evaluada con un `get()` sobre el propio doc). Hoy `/cms` no escribe en ninguna de estas colecciones (shell vacío), pero **cualquier módulo nuevo que lo haga (ej. editor de ejercicios, editor de tienda) ya queda cubierto** siempre que el usuario logueado en `/cms` tenga `isAdmin: true` en Firestore.
```

pasa a:

```markdown
- **Lectura**: `users`, `exercises`, `shop_items`, `shop_collections`, `config`, `whats_new_items` — cualquier usuario autenticado (Firebase Auth). El login de `/cms` usa el mismo Firebase Auth del proyecto, así que la lectura de `auth.store.ts` (`getDoc(doc(db, 'users', uid))` para comprobar `isAdmin`) sigue funcionando sin cambios.
- **Escritura de `exercises`, `shop_items`, `shop_collections`, `config`, `whats_new_items`**: requiere que el usuario autenticado tenga `users/{uid}.isAdmin == true` (regla `isAdmin()` en `firestore.rules`, evaluada con un `get()` sobre el propio doc). El módulo `/cms/novedades` ya escribe en `whats_new_items` y en `config/appConfig.whatsNewVersion` bajo esta regla.
```

- [ ] **Step 3: Verificar**

Leer el archivo completo (`sed -n '260,390p' /Users/cris/Desktop/forge_web/.claude/BACKEND.md`) y confirmar que los bloques de código siguen bien cerrados y que no quedó ninguna mención residual a "`/cms` no escribe en ninguna colección".

---

## Fase B — CMS (repo `forge_web`)

Todas las rutas de esta fase son relativas a `/Users/cris/Desktop/forge_web`.

### Task 4: Tipo `CmsWhatsNewItem`

**Files:**
- Create: `app/types/cms/whatsNew.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
export interface CmsWhatsNewItem {
  id: string
  title: string
  description: string
  imageUrl: string | null
  order: number
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
}
```

- [ ] **Step 2: Verificar**

Run: `npx vue-tsc --noEmit -p . 2>&1 | grep -i "whatsNew"`
Expected: sin salida (archivo nuevo sin consumidores todavía, no puede haber errores).

---

### Task 5: Servicio `whatsNew.service.ts`

**Files:**
- Create: `app/services/cms/whatsNew.service.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getWhatsNewItems(): Promise<CmsWhatsNewItem[]> {
  const db = getFirestore()
  const q = query(collection(db, 'whats_new_items'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      title: data.title ?? '',
      description: data.description ?? '',
      imageUrl: data.imageUrl ?? null,
      order: data.order ?? 0,
      isActive: data.isActive === true,
      createdAt: toDateOrNull(data.createdAt),
      updatedAt: toDateOrNull(data.updatedAt),
    }
  })
}

export async function createWhatsNewItem(title: string, description: string): Promise<string> {
  const db = getFirestore()
  const docRef = await addDoc(collection(db, 'whats_new_items'), {
    title,
    description,
    imageUrl: null,
    isActive: true,
    order: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateWhatsNewItem(id: string, title: string, description: string): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), {
    title,
    description,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWhatsNewItem(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'whats_new_items', id))
}

export async function toggleWhatsNewActive(id: string, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { isActive, updatedAt: serverTimestamp() })
}

export async function updateWhatsNewItemOrder(id: string, order: number): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { order })
}

export async function uploadWhatsNewImage(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `whats_new/${id}/photo.jpg`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { imageUrl: url, updatedAt: serverTimestamp() })
  return url
}

export async function deleteWhatsNewImage(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `whats_new/${id}/photo.jpg`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (!(e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found')) {
      throw e
    }
  }
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { imageUrl: null, updatedAt: serverTimestamp() })
}

export async function getWhatsNewVersion(): Promise<number> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'config', 'appConfig'))
  return snap.data()?.whatsNewVersion ?? 0
}

export async function bumpWhatsNewVersion(currentVersion: number): Promise<number> {
  const db = getFirestore()
  const next = currentVersion + 1
  await setDoc(doc(db, 'config', 'appConfig'), { whatsNewVersion: next }, { merge: true })
  return next
}
```

- [ ] **Step 2: Verificar**

Run: `npx vue-tsc --noEmit -p . 2>&1 | grep -i "whatsNew.service"`
Expected: sin salida.

---

### Task 6: Store `whatsNew.store.ts`

**Files:**
- Create: `app/stores/cms/whatsNew.store.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'
import {
  getWhatsNewItems,
  createWhatsNewItem,
  updateWhatsNewItem,
  deleteWhatsNewItem,
  toggleWhatsNewActive,
  updateWhatsNewItemOrder,
  uploadWhatsNewImage,
  deleteWhatsNewImage,
  getWhatsNewVersion,
  bumpWhatsNewVersion,
} from '~/services/cms/whatsNew.service'

export const useCmsWhatsNewStore = defineStore('cmsWhatsNew', () => {
  const items = ref<CmsWhatsNewItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  const version = ref(0)
  const versionLoading = ref(false)
  const forcing = ref(false)
  const forceError = ref<string | null>(null)

  async function fetchItems(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await getWhatsNewItems()
    } catch {
      error.value = 'No se pudieron cargar las Novedades.'
    } finally {
      loading.value = false
    }
  }

  async function fetchVersion(): Promise<void> {
    versionLoading.value = true
    try {
      version.value = await getWhatsNewVersion()
    } catch {
      // La página ya muestra el error principal del listado si algo falla.
    } finally {
      versionLoading.value = false
    }
  }

  async function saveItem(
    title: string,
    description: string,
    imageFile: File | null,
    removeImage: boolean,
    id?: string,
  ): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      let itemId = id
      if (itemId) {
        await updateWhatsNewItem(itemId, title, description)
      } else {
        itemId = await createWhatsNewItem(title, description)
      }
      if (imageFile) {
        await uploadWhatsNewImage(itemId, imageFile)
      } else if (removeImage) {
        await deleteWhatsNewImage(itemId)
      }
      await fetchItems()
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar la pantalla.'
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeItem(id: string): Promise<boolean> {
    try {
      await deleteWhatsNewItem(id)
      items.value = items.value.filter((i) => i.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function toggleActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await toggleWhatsNewActive(id, isActive)
      const item = items.value.find((i) => i.id === id)
      if (item) item.isActive = isActive
      return true
    } catch {
      return false
    }
  }

  async function moveItem(id: string, direction: 'up' | 'down'): Promise<void> {
    const index = items.value.findIndex((i) => i.id === id)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.value.length) return
    const current = items.value[index]
    const target = items.value[targetIndex]
    if (!current || !target) return
    const currentOrder = current.order
    const targetOrder = target.order
    try {
      await Promise.all([
        updateWhatsNewItemOrder(current.id, targetOrder),
        updateWhatsNewItemOrder(target.id, currentOrder),
      ])
      current.order = targetOrder
      target.order = currentOrder
      items.value = [...items.value].sort((a, b) => a.order - b.order)
    } catch {
      error.value = 'No se pudo reordenar.'
    }
  }

  async function forceReappear(): Promise<boolean> {
    forcing.value = true
    forceError.value = null
    try {
      version.value = await bumpWhatsNewVersion(version.value)
      return true
    } catch (e) {
      forceError.value = e instanceof FirebaseError
        ? `No se pudo forzar la reaparición (${e.code}).`
        : 'No se pudo forzar la reaparición.'
      return false
    } finally {
      forcing.value = false
    }
  }

  return {
    items,
    loading,
    error,
    saving,
    saveError,
    version,
    versionLoading,
    forcing,
    forceError,
    fetchItems,
    fetchVersion,
    saveItem,
    removeItem,
    toggleActive,
    moveItem,
    forceReappear,
  }
})
```

- [ ] **Step 2: Verificar**

Run: `npx vue-tsc --noEmit -p . 2>&1 | grep -i "whatsNew.store"`
Expected: sin salida.

---

### Task 7: Componente `WhatsNewRow.vue`

**Files:**
- Create: `app/components/cms/whatsNew/WhatsNewRow.vue`

- [ ] **Step 1: Crear el archivo**

```vue
<script setup lang="ts">
import { Pencil, Trash2, ChevronUp, ChevronDown, ImageOff } from 'lucide-vue-next'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'

defineProps<{
  item: CmsWhatsNewItem
  isFirst: boolean
  isLast: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  toggle: [isActive: boolean]
  moveUp: []
  moveDown: []
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-b border-forge-divider px-4 py-3 text-sm last:border-b-0">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-forge-surfaceAlt">
        <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="h-full w-full object-cover">
        <ImageOff v-else :size="18" class="text-forge-muted" />
      </div>
      <div class="min-w-0">
        <p class="truncate font-medium text-forge-text">{{ item.title }}</p>
        <p class="truncate text-xs text-forge-muted">{{ item.description }}</p>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <button
        type="button"
        class="rounded p-1.5 text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Mover arriba"
        :disabled="isFirst"
        @click="emit('moveUp')"
      >
        <ChevronUp :size="16" />
      </button>
      <button
        type="button"
        class="rounded p-1.5 text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Mover abajo"
        :disabled="isLast"
        @click="emit('moveDown')"
      >
        <ChevronDown :size="16" />
      </button>
    </div>

    <button
      type="button"
      class="shrink-0 rounded px-2 py-1 text-[10px] uppercase tracking-wide"
      :class="item.isActive
        ? 'bg-forge-success/10 text-forge-success'
        : 'bg-forge-surfaceAlt text-forge-muted'"
      @click="emit('toggle', !item.isActive)"
    >
      {{ item.isActive ? 'Activa' : 'Inactiva' }}
    </button>

    <div class="flex shrink-0 items-center gap-1">
      <button
        type="button"
        class="rounded p-2 text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text"
        aria-label="Editar"
        @click="emit('edit')"
      >
        <Pencil class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="rounded p-2 text-forge-textSec hover:bg-forge-danger/10 hover:text-forge-danger"
        aria-label="Eliminar"
        @click="emit('delete')"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar**

Run: `npx vue-tsc --noEmit -p . 2>&1 | grep -i "WhatsNewRow"`
Expected: sin salida.

---

### Task 8: Componente `WhatsNewFormModal.vue`

**Files:**
- Create: `app/components/cms/whatsNew/WhatsNewFormModal.vue`

- [ ] **Step 1: Crear el archivo**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Camera, Trash2 } from 'lucide-vue-next'
import { useCmsWhatsNewStore } from '~/stores/cms/whatsNew.store'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'

const props = defineProps<{
  open: boolean
  editingItem: CmsWhatsNewItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const whatsNewStore = useCmsWhatsNewStore()

const title = ref('')
const description = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const removeImage = ref(false)
const imageInput = ref<HTMLInputElement>()
const loading = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      title.value = props.editingItem?.title ?? ''
      description.value = props.editingItem?.description ?? ''
      imagePreview.value = props.editingItem?.imageUrl ?? null
      imageFile.value = null
      removeImage.value = false
      errorMessage.value = null
    }
  },
)

function pickImage() {
  imageInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    removeImage.value = false
  }
  target.value = ''
}

function handleRemoveImage() {
  imageFile.value = null
  imagePreview.value = null
  removeImage.value = true
}

async function handleSubmit() {
  if (!title.value.trim() || !description.value.trim()) return
  loading.value = true
  errorMessage.value = null
  const ok = await whatsNewStore.saveItem(
    title.value.trim(),
    description.value.trim(),
    imageFile.value,
    removeImage.value,
    props.editingItem?.id,
  )
  loading.value = false
  if (ok) {
    emit('close')
  } else {
    errorMessage.value = whatsNewStore.saveError ?? 'No se pudo guardar la pantalla.'
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-lg rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">
        {{ editingItem ? 'Editar pantalla' : 'Nueva pantalla' }}
      </h2>

      <div class="mt-4 space-y-4">
        <div>
          <label for="wn-title" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Título
          </label>
          <input
            id="wn-title"
            v-model="title"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>
        <div>
          <label for="wn-description" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Descripción
          </label>
          <textarea
            id="wn-description"
            v-model="description"
            rows="3"
            class="w-full resize-none rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-forge-textSec">Imagen (opcional)</label>
          <div class="flex items-center gap-3">
            <div class="relative h-24 w-24 overflow-hidden rounded-lg bg-forge-surfaceAlt">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Preview"
                class="h-full w-full object-cover"
              >
              <div v-else class="flex h-full w-full items-center justify-center text-forge-muted">
                <Camera :size="20" />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-text hover:bg-forge-surfaceAlt"
                @click="pickImage"
              >
                <Camera :size="14" />
                {{ imagePreview ? 'Cambiar imagen' : 'Subir imagen' }}
              </button>
              <button
                v-if="imagePreview"
                type="button"
                class="flex items-center gap-1.5 rounded-lg border border-forge-divider px-3 py-1.5 text-xs font-medium text-forge-danger hover:bg-forge-danger/10"
                @click="handleRemoveImage"
              >
                <Trash2 :size="14" />
                Eliminar imagen
              </button>
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            >
          </div>
        </div>
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-forge-danger">
        {{ errorMessage }}
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
          :disabled="loading || !title.trim() || !description.trim()"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleSubmit"
        >
          {{ loading ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar**

Run: `npx vue-tsc --noEmit -p . 2>&1 | grep -i "WhatsNewFormModal"`
Expected: sin salida.

---

### Task 9: Página `/cms/novedades`

**Files:**
- Create: `app/pages/cms/novedades/index.vue`

- [ ] **Step 1: Crear el archivo**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, RotateCcw } from 'lucide-vue-next'
import { useCmsWhatsNewStore } from '~/stores/cms/whatsNew.store'
import WhatsNewRow from '~/components/cms/whatsNew/WhatsNewRow.vue'
import WhatsNewFormModal from '~/components/cms/whatsNew/WhatsNewFormModal.vue'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'

definePageMeta({ layout: 'cms' })

const whatsNewStore = useCmsWhatsNewStore()

const showFormModal = ref(false)
const editingItem = ref<CmsWhatsNewItem | null>(null)

const showDeleteConfirm = ref(false)
const deletingItem = ref<CmsWhatsNewItem | null>(null)
const deleting = ref(false)

const showForceConfirm = ref(false)

onMounted(() => {
  whatsNewStore.fetchItems()
  whatsNewStore.fetchVersion()
})

function openCreateModal() {
  editingItem.value = null
  showFormModal.value = true
}

function openEditModal(item: CmsWhatsNewItem) {
  editingItem.value = item
  showFormModal.value = true
}

function openDeleteConfirm(item: CmsWhatsNewItem) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  await whatsNewStore.removeItem(deletingItem.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  deletingItem.value = null
}

async function handleForceReappear() {
  await whatsNewStore.forceReappear()
  showForceConfirm.value = false
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-forge-text">Novedades</h1>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg border border-forge-divider px-4 py-2 text-sm font-medium text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="showForceConfirm = true"
        >
          <RotateCcw class="h-4 w-4" />
          Forzar reaparición
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent"
          @click="openCreateModal"
        >
          <Plus class="h-4 w-4" />
          Nueva pantalla
        </button>
      </div>
    </div>

    <EmptyState
      v-if="whatsNewStore.error"
      title="No se pudieron cargar las Novedades"
      :description="whatsNewStore.error"
    />

    <div v-else-if="whatsNewStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="whatsNewStore.items.length === 0"
      title="Todavía no hay pantallas de Novedades"
      description="Crea la primera con el botón de arriba."
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <WhatsNewRow
        v-for="(item, index) in whatsNewStore.items"
        :key="item.id"
        :item="item"
        :is-first="index === 0"
        :is-last="index === whatsNewStore.items.length - 1"
        @edit="openEditModal(item)"
        @delete="openDeleteConfirm(item)"
        @toggle="(isActive) => whatsNewStore.toggleActive(item.id, isActive)"
        @move-up="whatsNewStore.moveItem(item.id, 'up')"
        @move-down="whatsNewStore.moveItem(item.id, 'down')"
      />
    </div>

    <WhatsNewFormModal
      :open="showFormModal"
      :editing-item="editingItem"
      @close="showFormModal = false"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Eliminar pantalla"
      :message="`¿Seguro que quieres eliminar «${deletingItem?.title ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />

    <ConfirmModal
      :open="showForceConfirm"
      title="Forzar reaparición"
      :message="`Todos los usuarios volverán a ver las Novedades la próxima vez que abran la app (versión actual: ${whatsNewStore.version}). ¿Continuar?`"
      confirm-label="Forzar"
      :loading="whatsNewStore.forcing"
      @confirm="handleForceReappear"
      @cancel="showForceConfirm = false"
    />
  </div>
</template>
```

- [ ] **Step 2: Verificar**

Run: `npx vue-tsc --noEmit -p . 2>&1 | grep -i "novedades"`
Expected: sin salida.

---

### Task 10: Entrada en `CmsSidebar.vue`

**Files:**
- Modify: `app/components/cms/layout/CmsSidebar.vue`

- [ ] **Step 1: Añadir `Sparkles` a los imports de iconos**

Cambiar:

```typescript
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
```

por:

```typescript
import {
  LayoutDashboard,
  Dumbbell,
  FileText,
  HelpCircle,
  Users,
  ShieldAlert,
  Bell,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-vue-next'
```

- [ ] **Step 2: Añadir el `NuxtLink` nuevo**

Justo después del bloque `NuxtLink` de "Ejercicios" (el último enlace real, antes del `v-for` de `comingSoon`), insertar:

```vue
      <NuxtLink
        to="/cms/novedades"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <Sparkles class="h-4 w-4" />
        Novedades
      </NuxtLink>
```

- [ ] **Step 3: Verificar**

Run: `npx vue-tsc --noEmit -p . 2>&1 | grep -i "CmsSidebar"`
Expected: sin salida.

---

### Task 11: Verificación completa de `forge_web`

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Type-check completo**

Run: `cd /Users/cris/Desktop/forge_web && npx vue-tsc --noEmit -p .`
Expected: sin errores nuevos relacionados con `whatsNew`/`novedades` (pueden existir warnings preexistentes de otras partes del repo, ignorarlos si no son de este módulo).

- [ ] **Step 2: Smoke test manual**

Run: `cd /Users/cris/Desktop/forge_web && npm run dev`, abrir `http://localhost:3000/cms/novedades` con sesión de admin ya logueada. Verificar:
- La página carga sin errores de consola.
- "Nueva pantalla" abre el modal, permite crear una pantalla con título+descripción+imagen, y aparece en el listado.
- Editar, activar/desactivar, mover arriba/abajo y eliminar funcionan contra Firestore real.
- "Forzar reaparición" incrementa el número mostrado tras confirmar.
- El enlace "Novedades" aparece en el sidebar y navega correctamente.

---

## Fase C — App móvil (repo `forge`)

Todas las rutas de esta fase son relativas a `/Users/cris/Desktop/forge`.

### Task 12: Entidad y repositorio abstracto

**Files:**
- Create: `lib/features/whats_new/domain/entities/whats_new_item_entity.dart`
- Create: `lib/features/whats_new/domain/repositories/whats_new_repository.dart`

- [ ] **Step 1: Crear la entidad**

```dart
class WhatsNewItemEntity {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;

  const WhatsNewItemEntity({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
  });
}
```

- [ ] **Step 2: Crear el repositorio abstracto**

```dart
import '../entities/whats_new_item_entity.dart';

abstract class WhatsNewRepository {
  Future<List<WhatsNewItemEntity>> fetchActiveItems();
  Future<int> fetchVersion();
}
```

- [ ] **Step 3: Verificar**

Run: `cd /Users/cris/Desktop/forge && flutter analyze lib/features/whats_new`
Expected: `No issues found!`

---

### Task 13: Datasource Firestore

**Files:**
- Create: `lib/features/whats_new/data/datasources/whats_new_firestore_datasource.dart`

- [ ] **Step 1: Crear el archivo**

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

import '../../domain/entities/whats_new_item_entity.dart';

class WhatsNewFirestoreDatasource {
  WhatsNewFirestoreDatasource({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  Future<List<WhatsNewItemEntity>> fetchActiveItems() async {
    final snap = await _db
        .collection('whats_new_items')
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();
    return snap.docs.map((d) => _fromMap(d.data(), d.id)).toList();
  }

  Future<int> fetchVersion() async {
    final snap = await _db.collection('config').doc('appConfig').get();
    return snap.data()?['whatsNewVersion'] as int? ?? 0;
  }

  WhatsNewItemEntity _fromMap(Map<String, dynamic> m, String id) {
    return WhatsNewItemEntity(
      id: id,
      title: m['title'] as String? ?? '',
      description: m['description'] as String? ?? '',
      imageUrl: m['imageUrl'] as String?,
    );
  }
}
```

- [ ] **Step 2: Verificar**

Run: `flutter analyze lib/features/whats_new`
Expected: `No issues found!`

---

### Task 14: Repositorio concreto

**Files:**
- Create: `lib/features/whats_new/data/repositories/whats_new_repository_impl.dart`

- [ ] **Step 1: Crear el archivo**

```dart
import '../../domain/entities/whats_new_item_entity.dart';
import '../../domain/repositories/whats_new_repository.dart';
import '../datasources/whats_new_firestore_datasource.dart';

class WhatsNewRepositoryImpl implements WhatsNewRepository {
  WhatsNewRepositoryImpl(this._ds);
  final WhatsNewFirestoreDatasource _ds;

  @override
  Future<List<WhatsNewItemEntity>> fetchActiveItems() => _ds.fetchActiveItems();

  @override
  Future<int> fetchVersion() => _ds.fetchVersion();
}
```

- [ ] **Step 2: Verificar**

Run: `flutter analyze lib/features/whats_new`
Expected: `No issues found!`

---

### Task 15: Providers Riverpod

**Files:**
- Create: `lib/features/whats_new/presentation/providers/whats_new_providers.dart`

- [ ] **Step 1: Crear el archivo**

```dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/whats_new_firestore_datasource.dart';
import '../../data/repositories/whats_new_repository_impl.dart';
import '../../domain/entities/whats_new_item_entity.dart';
import '../../domain/repositories/whats_new_repository.dart';

const _kWhatsNewSeenVersionKey = 'whats_new_seen_version';

final _firestoreProvider =
    Provider<FirebaseFirestore>((ref) => FirebaseFirestore.instance);

final whatsNewDatasourceProvider = Provider<WhatsNewFirestoreDatasource>(
  (ref) => WhatsNewFirestoreDatasource(firestore: ref.watch(_firestoreProvider)),
);

final whatsNewRepositoryProvider = Provider<WhatsNewRepository>(
  (ref) => WhatsNewRepositoryImpl(ref.watch(whatsNewDatasourceProvider)),
);

final whatsNewListProvider = FutureProvider<List<WhatsNewItemEntity>>((ref) {
  return ref.watch(whatsNewRepositoryProvider).fetchActiveItems();
});

final whatsNewRemoteVersionProvider = FutureProvider<int>((ref) {
  return ref.watch(whatsNewRepositoryProvider).fetchVersion();
});

/// True si hay pantallas activas y la versión remota es mayor que la
/// última vista guardada localmente (cubre "primera vez" y "forzado").
final whatsNewShouldShowProvider = FutureProvider<bool>((ref) async {
  final items = await ref.watch(whatsNewListProvider.future);
  if (items.isEmpty) return false;
  final remoteVersion = await ref.watch(whatsNewRemoteVersionProvider.future);
  final prefs = ref.watch(sharedPreferencesProvider);
  final seenVersion = prefs.getInt(_kWhatsNewSeenVersionKey) ?? 0;
  return remoteVersion > seenVersion;
});

/// Persiste la versión remota actual como "vista". Llamar al cerrar
/// [WhatsNewScreen], tanto si se disparó sola como si se abrió desde Settings.
Future<void> markWhatsNewSeen(WidgetRef ref) async {
  final version = await ref.read(whatsNewRemoteVersionProvider.future);
  await ref.read(sharedPreferencesProvider).setInt(_kWhatsNewSeenVersionKey, version);
}
```

- [ ] **Step 2: Verificar**

Run: `flutter analyze lib/features/whats_new`
Expected: `No issues found!`

---

### Task 16: Claves de localización nuevas

**Files:**
- Modify: `lib/l10n/app_es.arb`
- Modify: `lib/l10n/app_en.arb`

- [ ] **Step 1: Añadir las claves en `app_es.arb`**

Después de la línea `"settingsSupportGettingStarted": "Guía de inicio",` (línea 228), insertar:

```json
  "settingsSupportWhatsNew": "Novedades",
```

Después de la línea `"soundUseButton": "Usar",` (línea ~1432, justo antes del bloque `intro*` que se retirará en la Tarea 20), insertar:

```json
  "whatsNewClose": "Cerrar",
  "whatsNewNext": "Siguiente",
  "whatsNewGotIt": "Entendido",
```

- [ ] **Step 2: Añadir las mismas claves en `app_en.arb`**

Después de `"settingsSupportGettingStarted": "Getting Started",`, insertar:

```json
  "settingsSupportWhatsNew": "What's New",
```

En el mismo punto relativo (junto al bloque `intro*` de `app_en.arb`), insertar:

```json
  "whatsNewClose": "Close",
  "whatsNewNext": "Next",
  "whatsNewGotIt": "Got it",
```

- [ ] **Step 3: Regenerar las localizaciones**

Run: `cd /Users/cris/Desktop/forge && flutter gen-l10n`
Expected: termina sin errores; `lib/l10n/app_localizations.dart`, `app_localizations_es.dart` y `app_localizations_en.dart` quedan con los getters `settingsSupportWhatsNew`, `whatsNewClose`, `whatsNewNext`, `whatsNewGotIt` añadidos automáticamente.

---

### Task 17: Pantalla `WhatsNewScreen`

**Files:**
- Create: `lib/features/whats_new/presentation/screens/whats_new_screen.dart`

- [ ] **Step 1: Crear el archivo**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors_theme.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/entities/whats_new_item_entity.dart';
import '../providers/whats_new_providers.dart';

class WhatsNewScreen extends ConsumerStatefulWidget {
  const WhatsNewScreen({super.key});

  @override
  ConsumerState<WhatsNewScreen> createState() => _WhatsNewScreenState();
}

class _WhatsNewScreenState extends ConsumerState<WhatsNewScreen> {
  final _pageCtrl = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _close() async {
    await markWhatsNewSeen(ref);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  void _next(int total) {
    if (_currentPage == total - 1) {
      _close();
    } else {
      _pageCtrl.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColorsTheme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final itemsAsync = ref.watch(whatsNewListProvider);

    return Scaffold(
      backgroundColor: c.background,
      body: itemsAsync.when(
        loading: () => Center(child: CircularProgressIndicator(color: c.primary)),
        error: (e, _) => Center(
          child: TextButton(
            onPressed: _close,
            child: Text(l10n.whatsNewClose, style: TextStyle(color: c.hint)),
          ),
        ),
        data: (items) {
          if (items.isEmpty) {
            WidgetsBinding.instance.addPostFrameCallback((_) => _close());
            return const SizedBox.shrink();
          }
          final total = items.length;
          final isLast = _currentPage == total - 1;

          return SafeArea(
            child: Column(
              children: [
                Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                    child: TextButton(
                      onPressed: _close,
                      child: Text(
                        l10n.whatsNewClose,
                        style: TextStyle(color: c.hint, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: PageView.builder(
                    controller: _pageCtrl,
                    physics: const BouncingScrollPhysics(),
                    itemCount: total,
                    onPageChanged: (i) => setState(() => _currentPage = i),
                    itemBuilder: (_, i) => _WhatsNewPage(item: items[i]),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(28, 0, 28, 28),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          total,
                          (i) => _Dot(active: i == _currentPage, color: c.primary),
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: () => _next(total),
                          style: FilledButton.styleFrom(
                            backgroundColor: c.primary,
                            foregroundColor: c.onPrimary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: Text(
                            isLast ? l10n.whatsNewGotIt : l10n.whatsNewNext,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _WhatsNewPage extends StatelessWidget {
  final WhatsNewItemEntity item;
  const _WhatsNewPage({required this.item});

  @override
  Widget build(BuildContext context) {
    final c = AppColorsTheme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(28, 16, 28, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: c.surface,
                border: Border.all(color: c.divider),
              ),
              clipBehavior: Clip.hardEdge,
              child: item.imageUrl != null
                  ? Image.network(item.imageUrl!, fit: BoxFit.cover)
                  : Center(
                      child: Icon(
                        Icons.auto_awesome_rounded,
                        size: 64,
                        color: c.primary.withValues(alpha: 0.5),
                      ),
                    ),
            ).animate().fadeIn(duration: 300.ms).scale(begin: const Offset(0.96, 0.96)),
          ),
          const SizedBox(height: 28),
          Text(
            item.title,
            style: TextStyle(
              color: c.onBackground,
              fontSize: 26,
              fontWeight: FontWeight.w900,
              height: 1.1,
            ),
          ).animate(delay: 80.ms).fadeIn(duration: 300.ms).slideY(begin: 0.15, curve: Curves.easeOut),
          const SizedBox(height: 10),
          Text(
            item.description,
            style: TextStyle(color: c.hint, fontSize: 15, height: 1.5),
          ).animate(delay: 140.ms).fadeIn(duration: 300.ms).slideY(begin: 0.1, curve: Curves.easeOut),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final bool active;
  final Color color;
  const _Dot({required this.active, required this.color});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeInOut,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: active ? 24 : 8,
      height: 8,
      decoration: BoxDecoration(
        color: active ? color : color.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
```

- [ ] **Step 2: Verificar**

Run: `flutter analyze lib/features/whats_new`
Expected: `No issues found!` (requiere que la Tarea 16 ya haya regenerado `whatsNewClose`/`whatsNewNext`/`whatsNewGotIt`).

---

### Task 18: Disparo en `MainShell`

**Files:**
- Modify: `lib/features/shell/presentation/screens/main_shell.dart`

- [ ] **Step 1: Añadir los imports nuevos**

Después de `import '../../../gamification/presentation/providers/xp_providers.dart';`, añadir:

```dart
import '../../../whats_new/presentation/providers/whats_new_providers.dart';
import '../../../whats_new/presentation/screens/whats_new_screen.dart';
```

- [ ] **Step 2: Insertar el trigger en el árbol de widgets**

Cambiar:

```dart
              children: [
                const OfflineBanner(),
                const _WelcomeBonusTrigger(),
                const _ActiveWorkoutBanner(),
                Expanded(
                  child: _LazyIndexedStack(index: index, children: _screens),
                ),
              ],
```

por:

```dart
              children: [
                const OfflineBanner(),
                const _WelcomeBonusTrigger(),
                const _WhatsNewTrigger(),
                const _ActiveWorkoutBanner(),
                Expanded(
                  child: _LazyIndexedStack(index: index, children: _screens),
                ),
              ],
```

- [ ] **Step 3: Añadir la clase `_WhatsNewTrigger`**

Justo después de la clase `_WelcomeBonusTrigger` (al final del archivo), añadir:

```dart

// ── Novedades Trigger ─────────────────────────────────────────────────────
// Zero-size widget que comprueba una vez por sesión si hay que mostrar el
// carrusel de Novedades (primera vez o versión forzada por el CMS) y, si
// toca, lo empuja como pantalla completa.

class _WhatsNewTrigger extends ConsumerStatefulWidget {
  const _WhatsNewTrigger();

  @override
  ConsumerState<_WhatsNewTrigger> createState() => _WhatsNewTriggerState();
}

class _WhatsNewTriggerState extends ConsumerState<_WhatsNewTrigger> {
  @override
  Widget build(BuildContext context) {
    ref.listen<AsyncValue<bool>>(whatsNewShouldShowProvider, (previous, next) {
      next.whenData((shouldShow) {
        if (shouldShow) {
          Navigator.of(context).push<void>(
            MaterialPageRoute(builder: (_) => const WhatsNewScreen()),
          );
        }
      });
    });
    return const SizedBox.shrink();
  }
}
```

- [ ] **Step 4: Verificar**

Run: `flutter analyze lib/features/shell/presentation/screens/main_shell.dart`
Expected: `No issues found!`

---

### Task 19: Ajuste "Novedades" en Settings

**Files:**
- Modify: `lib/features/profile/presentation/screens/settings_screen.dart`

- [ ] **Step 1: Añadir el import**

El bloque de imports tiene varios grupos por profundidad de ruta; `whats_new_screen.dart` usa el mismo patrón `../../../<feature>/...` que los imports de `legal`, así que va junto a ellos (orden alfabético: `legal` antes de `whats_new`), no junto a `getting_started_screen.dart` (que es del mismo directorio, patrón `'nombre.dart'` sin `../`).

Después de:

```dart
import '../../../legal/presentation/screens/legal_document_screen.dart';
```

añadir:

```dart
import '../../../whats_new/presentation/screens/whats_new_screen.dart';
```

- [ ] **Step 2: Añadir el tile en la sección Soporte**

Cambiar:

```dart
            SettingsGroup(
              delay: 200,
              children: [
                SettingsTile(
                  iconColor: const Color(0xFF10B981),
                  icon: Icons.menu_book_rounded,
                  title: l10n.settingsSupportGettingStarted,
                  onTap: () => Navigator.push(
                    context,
                    _fadeRoute(const GettingStartedScreen()),
                  ),
                ),
```

por:

```dart
            SettingsGroup(
              delay: 200,
              children: [
                SettingsTile(
                  iconColor: const Color(0xFFF59E0B),
                  icon: Icons.new_releases_rounded,
                  title: l10n.settingsSupportWhatsNew,
                  onTap: () => Navigator.push(
                    context,
                    _fadeRoute(const WhatsNewScreen()),
                  ),
                ),
                SettingsTile(
                  iconColor: const Color(0xFF10B981),
                  icon: Icons.menu_book_rounded,
                  title: l10n.settingsSupportGettingStarted,
                  onTap: () => Navigator.push(
                    context,
                    _fadeRoute(const GettingStartedScreen()),
                  ),
                ),
```

- [ ] **Step 3: Verificar**

Run: `flutter analyze lib/features/profile/presentation/screens/settings_screen.dart`
Expected: `No issues found!` (requiere que la Tarea 16 ya haya generado `settingsSupportWhatsNew`).

---

### Task 20: Retirar `introduction_screen.dart` y su gate

**Files:**
- Delete: `lib/features/onboarding/presentation/screens/introduction_screen.dart`
- Modify: `lib/features/splash/presentation/screens/splash_screen.dart`
- Modify: `lib/l10n/app_es.arb`
- Modify: `lib/l10n/app_en.arb`

- [ ] **Step 1: Borrar la pantalla**

Run: `rm /Users/cris/Desktop/forge/lib/features/onboarding/presentation/screens/introduction_screen.dart`

- [ ] **Step 2: Simplificar el gate en `splash_screen.dart`**

Cambiar los imports del principio del archivo:

```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../features/auth/presentation/providers/auth_providers.dart';
import '../../../../features/exercises/domain/entities/exercise_entity.dart';
import '../../../../features/exercises/presentation/providers/exercises_providers.dart';
import '../../../../features/onboarding/presentation/screens/introduction_screen.dart';
import '../../../../main.dart';
```

por:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../features/exercises/domain/entities/exercise_entity.dart';
import '../../../../features/exercises/presentation/providers/exercises_providers.dart';
import '../../../../main.dart';
```

Cambiar el método `_load`:

```dart
  Future<void> _load() async {
    await Future.wait([
      Future.delayed(_minDuration),
      ref
          .read(allExercisesProvider.future)
          .catchError((_) => <ExerciseEntity>[]),
    ]);
    if (!mounted) return;
    setState(() => _loaded = true);
    await Future.delayed(const Duration(milliseconds: 100));
    if (!mounted) return;

    final introViewed =
        ref.read(sharedPreferencesProvider).getBool('intro_viewed') ?? false;

    // If already signed in, skip the intro regardless of the flag.
    // This handles users who installed before the intro was added and
    // never had intro_viewed written to SharedPreferences.
    final alreadySignedIn = FirebaseAuth.instance.currentUser != null;
    if (alreadySignedIn && !introViewed) {
      await ref
          .read(sharedPreferencesProvider)
          .setBool('intro_viewed', true);
      if (!mounted) return;
    }

    final nextScreen =
        (introViewed || alreadySignedIn) ? const AuthGate() : const IntroductionScreen();

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, a, b) => nextScreen,
        transitionsBuilder: (_, anim, b, child) => FadeTransition(
          opacity: CurvedAnimation(parent: anim, curve: Curves.easeIn),
          child: child,
        ),
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }
```

por:

```dart
  Future<void> _load() async {
    await Future.wait([
      Future.delayed(_minDuration),
      ref
          .read(allExercisesProvider.future)
          .catchError((_) => <ExerciseEntity>[]),
    ]);
    if (!mounted) return;
    setState(() => _loaded = true);
    await Future.delayed(const Duration(milliseconds: 100));
    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, a, b) => const AuthGate(),
        transitionsBuilder: (_, anim, b, child) => FadeTransition(
          opacity: CurvedAnimation(parent: anim, curve: Curves.easeIn),
          child: child,
        ),
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }
```

- [ ] **Step 3: Eliminar las claves `intro*` de `app_es.arb`**

Borrar estas 10 líneas (el bloque completo entre `soundUseButton` e `introNext`):

```json
  "introWelcomeSubtitle": "Entrena sin límites.\nConstruye sin excusas.",
  "introWorkoutsTitle": "CADA REP\nCUENTA",
  "introWorkoutsSubtitle": "Registra pesos, series y reps.\nTodo en un solo lugar.",
  "introCompeteTitle": "COMPITE EN\nTIEMPO REAL",
  "introCompeteSubtitle": "Reta a tus amigos\ny demuestra quién manda.",
  "introProgressTitle": "VISUALIZA TU\nEVOLUCIÓN",
  "introProgressSubtitle": "Estadísticas reales que te\nmotivan a seguir adelante.",
  "introGetStarted": "Comenzar",
  "introSkip": "Saltar",
  "introNext": "Siguiente",
```

(Las claves nuevas `whatsNewClose`/`whatsNewNext`/`whatsNewGotIt` añadidas en la Tarea 16 en ese mismo punto del archivo se quedan — solo se borran las 10 líneas `intro*` de arriba.)

- [ ] **Step 4: Eliminar las claves `intro*` de `app_en.arb`**

Borrar el bloque equivalente de 10 líneas en `app_en.arb` (mismas claves, valores en inglés — ver contenido actual antes de borrar para copiar las líneas exactas).

- [ ] **Step 5: Regenerar las localizaciones**

Run: `flutter gen-l10n`
Expected: termina sin errores; los getters `intro*` desaparecen de `app_localizations*.dart`.

- [ ] **Step 6: Verificar que no queda ninguna referencia colgante**

Run: `grep -rn "IntroductionScreen\|intro_viewed\|l10n\.intro" lib/`
Expected: sin resultados.

Run: `flutter analyze`
Expected: `No issues found!` (analiza todo el proyecto — confirma que retirar `introduction_screen.dart` no rompió nada más).

---

### Task 21: Verificación final de `forge`

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Análisis estático completo**

Run: `cd /Users/cris/Desktop/forge && flutter analyze`
Expected: `No issues found!`

- [ ] **Step 2: Smoke test manual en dispositivo/emulador**

Con al menos una pantalla creada y activa en `/cms/novedades` (Tarea 11):
- Instalar la app en una cuenta que **no** tenga `whats_new_seen_version` guardado (desinstalar/reinstalar, o borrar datos de la app) y completar el login/onboarding wizard → el carrusel de Novedades debe aparecer automáticamente al llegar a Home.
- Pasar todas las pantallas con "Siguiente" y la última con "Entendido" (o pulsar "Cerrar") → vuelve a Home y no reaparece al reabrir la app.
- Desde el CMS, pulsar "Forzar reaparición" → reabrir la app (o solo volver a primer plano si `MainShell` sigue montado, si no, matar y reabrir) → el carrusel vuelve a aparecer.
- Desde Settings → Soporte → "Novedades" → se abre el carrusel bajo demanda en cualquier momento.
- Comprobar que "Guía de inicio" sigue funcionando igual que antes (no debe haberse tocado).

---

## Fase D — Pasos manuales (usuario)

### Task 22: Checklist manual fuera del alcance de un agente

Estos pasos requieren credenciales/acceso que un agente no debe ejecutar sin supervisión directa — el usuario los ejecuta cuando esté listo:

- [ ] Revisar el diff de `firestore.rules` (Tarea 1) y desplegar: `cd /Users/cris/Desktop/forge && firebase deploy --only firestore:rules`.
- [ ] Tras el deploy, verificar en la consola de Firebase (o con una prueba manual) que una lectura autenticada a `whats_new_items` funciona y una escritura sin `isAdmin` falla.
- [ ] Crear el contenido real de Novedades desde `/cms/novedades` (las pantallas de prueba usadas para el smoke test de la Tarea 11/21 son solo de prueba, no contenido final).
- [ ] Revisar y commitear los cambios en ambos repos (`forge_web` y `forge`) cuando esté conforme — ningún paso de este plan hace commit automáticamente.
- [ ] Publicar una nueva build de la app (`forge`) para que los usuarios reales dejen de usar la ruta antigua (`introduction_screen.dart` retirado) y empiecen a usar el flujo nuevo.
