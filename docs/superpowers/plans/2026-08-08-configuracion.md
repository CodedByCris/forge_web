# Configuración global — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/cms/configuracion` edita `config/appConfig.exercisesCacheKey` — el único campo de configuración global real que existe hoy.

**Architecture:** Mismo patrón `services → stores → pages` que el resto del CMS, 100% client-side. Sin componentes nuevos más allá de la página (reutiliza `ConfirmModal` y `EmptyState` ya existentes).

**Tech Stack:** Nuxt 4/Pinia/Firebase JS SDK. Cero dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-08-08-configuracion-design.md`

---

## Nota sobre este plan

- Commits en `forge_web`: autorizados, uno al final (Task 5).
- Sin cambios en `forge` en este plan (ni rules ni Flutter).
- Sin tests.

---

### Task 1: Tipos CMS

**Files:**
- Create: `app/types/cms/config.ts`

- [ ] **Step 1**:

```typescript
// app/types/cms/config.ts
export interface CmsAppConfig {
  exercisesCacheKey: string
}
```

- [ ] **Step 2**: Typecheck (`npx vue-tsc --noEmit --project .nuxt/tsconfig.json`,
`npx nuxi prepare` antes si hace falta). Sin errores nuevos.

---

### Task 2: Servicio `config.service.ts`

**Files:**
- Create: `app/services/cms/config.service.ts`

- [ ] **Step 1**:

```typescript
// app/services/cms/config.service.ts
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import type { CmsAppConfig } from '~/types/cms/config'

export async function getAppConfig(): Promise<CmsAppConfig> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'config', 'appConfig'))
  return {
    exercisesCacheKey: snap.data()?.exercisesCacheKey ?? '',
  }
}

export async function updateExercisesCacheKey(value: string): Promise<void> {
  const db = getFirestore()
  await setDoc(doc(db, 'config', 'appConfig'), { exercisesCacheKey: value }, { merge: true })
}
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

---

### Task 3: Store `config.store.ts`

**Files:**
- Create: `app/stores/cms/config.store.ts`

- [ ] **Step 1**:

```typescript
// app/stores/cms/config.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import { getAppConfig, updateExercisesCacheKey } from '~/services/cms/config.service'

export const useCmsConfigStore = defineStore('cmsConfig', () => {
  const exercisesCacheKey = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchConfig(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const config = await getAppConfig()
      exercisesCacheKey.value = config.exercisesCacheKey
    } catch {
      error.value = 'No se pudo cargar la configuración.'
    } finally {
      loading.value = false
    }
  }

  async function save(value: string): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      await updateExercisesCacheKey(value)
      exercisesCacheKey.value = value
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar la configuración.'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    exercisesCacheKey,
    loading,
    error,
    saving,
    saveError,
    fetchConfig,
    save,
  }
})
```

- [ ] **Step 2**: Typecheck. Sin errores nuevos.

---

### Task 4: Página `/cms/configuracion` + sidebar

**Files:**
- Create: `app/pages/cms/configuracion/index.vue`
- Modify: `app/components/cms/layout/CmsSidebar.vue`

- [ ] **Step 1**:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCmsConfigStore } from '~/stores/cms/config.store'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const configStore = useCmsConfigStore()

const draft = ref('')
const showConfirm = ref(false)

onMounted(async () => {
  await configStore.fetchConfig()
  draft.value = configStore.exercisesCacheKey
})

function useTodayAsValue() {
  draft.value = new Date().toISOString().slice(0, 10)
}

function askSave() {
  if (draft.value.trim() === '') return
  showConfirm.value = true
}

async function handleConfirm() {
  await configStore.save(draft.value.trim())
  showConfirm.value = false
}
</script>

<template>
  <div class="max-w-xl">
    <h1 class="mb-6 text-xl font-bold text-forge-text">Configuración</h1>

    <EmptyState
      v-if="configStore.error"
      title="No se pudo cargar la configuración"
      :description="configStore.error"
    />

    <div v-else-if="configStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <div v-else class="space-y-4">
      <div>
        <label for="cache-key" class="mb-1.5 block text-xs font-medium text-forge-textSec">
          Cache de ejercicios (exercisesCacheKey)
        </label>
        <p class="mb-2 text-xs text-forge-muted">
          Cambiar este valor hace que todos los dispositivos recarguen el
          catálogo de ejercicios la próxima vez que abran la app.
        </p>
        <div class="flex gap-2">
          <input
            id="cache-key"
            v-model="draft"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
          <button
            type="button"
            class="shrink-0 rounded-lg border border-forge-divider px-3 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
            @click="useTodayAsValue"
          >
            Usar fecha de hoy
          </button>
        </div>
      </div>

      <p v-if="configStore.saveError" class="text-sm text-forge-danger">
        {{ configStore.saveError }}
      </p>

      <button
        type="button"
        :disabled="draft.trim() === '' || configStore.saving"
        class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
        @click="askSave"
      >
        Guardar
      </button>
    </div>

    <ConfirmModal
      :open="showConfirm"
      title="Guardar configuración"
      message="Todos los dispositivos recargarán el catálogo de ejercicios la próxima vez que abran la app. ¿Continuar?"
      confirm-label="Guardar"
      :loading="configStore.saving"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>
```

- [ ] **Step 2**: Activar "Configuración" en el sidebar. En
`app/components/cms/layout/CmsSidebar.vue`, quitar "Configuración" de
`comingSoon` (dejando solo "Ejercicios"):

```typescript
const comingSoon = [
  { label: 'Ejercicios', icon: Dumbbell },
]
```

Y añadir un `NuxtLink` real, después del de "Moderación":

```vue
      <NuxtLink
        to="/cms/configuracion"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-forge-textSec transition-all duration-150 ease-out hover:bg-forge-surfaceAlt hover:text-forge-text"
        active-class="!bg-forge-primary/10 !text-forge-primary border-l-2 border-forge-primary"
      >
        <Settings class="h-4 w-4" />
        Configuración
      </NuxtLink>
```

(El import de `Settings` desde `lucide-vue-next` ya existe en el archivo.)

- [ ] **Step 3**: Typecheck + `npm run dev` + `curl http://localhost:3000/cms/configuracion` → 200. Matar el proceso dev al terminar.

---

### Task 5: Verificación funcional + commit

**Files:** ninguno nuevo.

- [ ] **Step 1**: `npm run generate`. Expected: sin errores, prerenderiza
`/cms/configuracion`.

- [ ] **Step 2**: Recorrido manual (navegador, `npm run dev`):
1. `/cms/configuracion` → muestra el valor actual real de
   `exercisesCacheKey` (o vacío si el doc no existe todavía).
2. Editar el valor (o usar "Usar fecha de hoy") → "Guardar" → confirmación
   → mensaje de éxito implícito (el valor mostrado se actualiza).
3. Confirmar en Firestore que `config/appConfig.exercisesCacheKey` cambió.

- [ ] **Step 3**: Commit.

```bash
git add app/types/cms/config.ts app/services/cms/config.service.ts app/stores/cms/config.store.ts app/pages/cms/configuracion/ app/components/cms/layout/CmsSidebar.vue docs/superpowers/plans/2026-08-08-configuracion.md docs/superpowers/specs/2026-08-08-configuracion-design.md
git commit -m "$(cat <<'EOF'
feat: añadir módulo Configuración al CMS

Editor de config/appConfig.exercisesCacheKey (único campo de
configuración global real implementado en la app hoy).
EOF
)"
```
