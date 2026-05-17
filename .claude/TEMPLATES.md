# Feature: Plantillas de Entrenamiento

## Qué hace

CRUD de plantillas de entrenamiento reutilizables. Máximo 5 por usuario. Cada plantilla define nombre, color y lista de ejercicios con sets/reps por defecto.

---

## Ruta

```
/train/templates          ← listado + acciones
```

---

## Archivos

```
services/template.service.ts
stores/template.store.ts
pages/train/templates/index.vue
components/workout/
  TemplateCard.vue
  TemplateFormModal.vue
  TemplateExerciseRow.vue
```

---

## Servicio Firestore

```typescript
// services/template.service.ts
import {
  collection, doc, onSnapshot, addDoc, setDoc,
  deleteDoc, serverTimestamp, query, orderBy, getDocs
} from 'firebase/firestore'
import { db } from '~/plugins/firebase.client'

const templatesRef = (userId: string) =>
  collection(db, 'users', userId, 'workout_templates')

export const templateService = {

  // Stream en tiempo real
  watchTemplates(userId: string, cb: (templates: WorkoutTemplate[]) => void): () => void {
    const q = query(templatesRef(userId), orderBy('updatedAt', 'desc'))
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map(d => mapTemplate(d)))
    })
  },

  async countTemplates(userId: string): Promise<number> {
    const snap = await getDocs(templatesRef(userId))
    return snap.size
  },

  // Crear nueva plantilla
  async createTemplate(userId: string, params: {
    name: string
    color: number
    exercises: PlannedExercise[]
  }): Promise<string> {
    const ref = await addDoc(templatesRef(userId), {
      name: params.name,
      color: params.color,
      exercises: params.exercises.map((e, i) => ({
        name: e.name,
        nameEs: e.nameEs ?? null,
        order: i,
        defaultSets: e.defaultSets,
        defaultReps: e.defaultReps,
        exerciseId: e.exerciseId ?? null,
        bodyParts: e.bodyParts,
        exerciseType: e.exerciseType,
      })),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  },

  // Actualizar plantilla existente
  async updateTemplate(userId: string, templateId: string, params: {
    name: string
    color: number
    exercises: PlannedExercise[]
  }): Promise<void> {
    await setDoc(doc(templatesRef(userId), templateId), {
      name: params.name,
      color: params.color,
      exercises: params.exercises.map((e, i) => ({ ...e, order: i })),
      updatedAt: serverTimestamp(),
    }, { merge: true })
  },

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    await deleteDoc(doc(templatesRef(userId), templateId))
  },
}

function mapTemplate(d: any): WorkoutTemplate {
  const data = d.data()
  return {
    id: d.id,
    name: data.name,
    color: data.color,
    exercises: (data.exercises ?? []).map((e: any) => ({
      name: e.name,
      nameEs: e.nameEs ?? null,
      order: e.order,
      defaultSets: e.defaultSets,
      defaultReps: e.defaultReps,
      exerciseId: e.exerciseId ?? null,
      bodyParts: e.bodyParts ?? [],
      exerciseType: e.exerciseType ?? 'standard',
    })),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  }
}
```

---

## Store

```typescript
// stores/template.store.ts
export const useTemplateStore = defineStore('templates', () => {
  const templates = ref<WorkoutTemplate[]>([])
  const loading = ref(false)
  let unsub: (() => void) | null = null

  const canCreateMore = computed(() => templates.value.length < 5)

  function subscribe(userId: string) {
    unsub?.()
    loading.value = true
    unsub = templateService.watchTemplates(userId, (data) => {
      templates.value = data
      loading.value = false
    })
  }

  function unsubscribe() {
    unsub?.()
    unsub = null
  }

  async function createTemplate(userId: string, params: {
    name: string
    color: number
    exercises: PlannedExercise[]
  }) {
    if (!canCreateMore.value) throw new Error('max_templates')
    return await templateService.createTemplate(userId, params)
  }

  async function updateTemplate(userId: string, id: string, params: {
    name: string
    color: number
    exercises: PlannedExercise[]
  }) {
    await templateService.updateTemplate(userId, id, params)
  }

  async function deleteTemplate(userId: string, id: string) {
    await templateService.deleteTemplate(userId, id)
  }

  return {
    templates, loading, canCreateMore,
    subscribe, unsubscribe,
    createTemplate, updateTemplate, deleteTemplate,
  }
})
```

---

## UI — Templates Page (`/train/templates`)

### Layout

```
AppBar: "Plantillas"  [+ Nueva]  (deshabilitado si 5/5)

─────────────────────────────

┌──────────────────────────────┐
│ 🟠  Push Day            [⋯] │
│ Press banca · Vuelos · ...   │
│ 3 ejercicios · 3×10          │
│                   [Iniciar →]│
└──────────────────────────────┘

┌──────────────────────────────┐
│ 🔵  Leg Day             [⋯] │
│ Sentadilla · Prensa · ...    │
│ 4 ejercicios · 4×8           │
│                   [Iniciar →]│
└──────────────────────────────┘

  (máx 5) — "3/5 plantillas"
```

### TemplateCard

- Color del borde/acento según `template.color` (argbToHex)
- Nombre grande + icono menú `⋯` (editar / eliminar)
- Preview: primeros 3 ejercicios como chips
- Contador: "N ejercicios"
- Botón primario "Iniciar →" → crea workout desde la plantilla

### Menú contextual `⋯`

- Editar → abre TemplateFormModal con datos precargados
- Eliminar → confirm dialog → delete

---

## TemplateFormModal

Modal bottom sheet o dialog fullscreen en mobile.

### Campos

```
┌─────────────────────────────────────┐
│  Nombre de la plantilla             │
│  ┌───────────────────────────────┐  │
│  │ Push Day                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Color                              │
│  ● ● ● ● ● ● (color picker simple) │
│                                     │
│  Ejercicios                         │
│  ┌─────────────────────────────┐    │
│  │ Press Banca    3 sets  10r  │    │
│  │ Vuelos         3 sets  12r  │    │
│  │ Fondos         3 sets  max  │    │
│  └─────────────────────────────┘    │
│  [+ Añadir ejercicio]               │
│                                     │
│  [Cancelar]        [Guardar]        │
└─────────────────────────────────────┘
```

### TemplateExerciseRow

- Nombre del ejercicio (texto)
- Sets: número editable (stepper o input)
- Reps: texto libre ('8-12', 'AMRAP', '10')
- Drag & drop para reordenar (opcional, v2)
- Botón eliminar ejercicio

### AddExerciseModal

- Buscador de ejercicios (filtra `exercises` colección cacheada)
- Filtros: músculo (chip selector)
- Tap en ejercicio → añade con defaults (3 sets, '10')

---

## Colores disponibles (ARGB palette)

```typescript
export const TEMPLATE_COLORS = [
  0xFFFF6200,  // naranja
  0xFF2196F3,  // azul
  0xFF4CAF50,  // verde
  0xFFE91E63,  // rosa
  0xFF9C27B0,  // morado
  0xFFFF9800,  // ámbar
  0xFF00BCD4,  // cyan
  0xFF607D8B,  // gris azulado
] as const
```

---

## Flujo: Iniciar desde plantilla

```
[Iniciar →] en TemplateCard
  → workoutService.createWorkout({ name, color })  // workoutId
  → exercises = template.exercises.map(toInitialDraft)
  → ghostSets = await workoutService.fetchGhostSets({ exerciseNames })
  → activeWorkoutStore.initWorkout({ workoutId, name, color, exercises })
  → activeWorkoutStore.ghostSets = ghostSets
  → navigateTo('/train/workout/active')
```

---

## Reglas de negocio

- Máximo **5** plantillas por usuario — mostrar contador "N/5"
- Si `canCreateMore === false` → botón "+ Nueva" deshabilitado + tooltip
- Orden por `updatedAt` desc
- Al guardar plantilla: `updatedAt = serverTimestamp()`
- Nombre requerido (mínimo 1 carácter, máximo 50)
- Mínimo 1 ejercicio para guardar
- `defaultReps` es texto libre (no número) para soportar '8-12', 'AMRAP', 'Max'

---

## Decisiones técnicas

- Templates en stream real-time (`onSnapshot`) → UI siempre actualizada
- El límite de 5 se valida en cliente (no hay Cloud Function para esto)
- Colores ARGB para compatibilidad con app móvil
- Ejercicios guardados como array en el doc (no subcollección) — tamaño esperado pequeño (≤20)
- `nameEs` guardado si el ejercicio tiene traducción, para mostrar en locale ES
