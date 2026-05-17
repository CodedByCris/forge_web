# Feature: Workout Activo

## Qué hace

Permite iniciar, gestionar y finalizar un entrenamiento. El workout activo vive en memoria (Pinia) mientras está en curso. Al finalizar se escribe todo en Firestore en batch.

Flujo completo:
1. Usuario crea workout (desde cero o desde plantilla)
2. Añade ejercicios y completa series
3. Finaliza → modal de feedback → batch write a Firestore → XP award → post en feed

---

## Rutas

```
/train                          ← dashboard con botón "Iniciar entrenamiento"
/train/workout/active           ← workout en curso (ruta protegida si hay draft activo)
/train/workout/[id]             ← detalle de workout completado (historial)
/train/workout/history          ← listado historial paginado
```

---

## Archivos

```
services/workout.service.ts
services/exercise.service.ts
stores/workout.store.ts
stores/active-workout.store.ts
pages/train/workout/active.vue
pages/train/workout/[id].vue
pages/train/workout/history.vue
components/workout/
  ExerciseCard.vue
  SetRow.vue
  SetTypeSelector.vue
  FeedbackModal.vue
  WorkoutSummaryCard.vue
  AddExerciseModal.vue
  WorkoutTimer.vue
  GhostSetBadge.vue
```

---

## Servicio Firestore

```typescript
// services/workout.service.ts
import {
  collection, doc, addDoc, updateDoc, writeBatch, getDocs,
  query, where, orderBy, limit, startAfter, serverTimestamp,
  getDoc, runTransaction, increment
} from 'firebase/firestore'
import { db } from '~/plugins/firebase.client'

export const workoutService = {

  // Crea el documento workout en Firestore y retorna el ID
  async createWorkout(params: {
    userId: string
    name: string
    color: number
  }): Promise<string> {
    const ref = await addDoc(collection(db, 'workouts'), {
      userId: params.userId,
      name: params.name,
      color: params.color,
      startedAt: serverTimestamp(),
      endedAt: null,
      isCompleted: false,
      multiSessionId: null,
      xpEarned: null,
      feedback: null,
    })
    return ref.id
  },

  // Escribe todos los ejercicios + marca workout como completado (batch)
  async finishWorkout(params: {
    workoutId: string
    exercises: FinishedExercise[]   // ver tipo abajo
    xpEarned: number
  }): Promise<void> {
    const batch = writeBatch(db)

    // Actualizar workout principal
    batch.update(doc(db, 'workouts', params.workoutId), {
      isCompleted: true,
      endedAt: serverTimestamp(),
      xpEarned: params.xpEarned,
    })

    // Escribir ejercicios en subcollección
    params.exercises.forEach((ex) => {
      const exRef = doc(collection(db, 'workouts', params.workoutId, 'exercises'))
      batch.set(exRef, {
        name: ex.name,
        nameEs: ex.nameEs ?? null,
        order: ex.order,
        exerciseType: ex.exerciseType,
        notes: ex.notes ?? null,
        sets: ex.sets.map((s, i) => ({
          setNumber: i + 1,
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
          setType: s.setType,
          durationSeconds: s.durationSeconds ?? null,
          distanceKm: s.distanceKm ?? null,
          inclinationPercent: s.inclinationPercent ?? null,
        })),
      })
    })

    await batch.commit()
  },

  // Guarda feedback del workout
  async saveFeedback(workoutId: string, feedback: WorkoutFeedback): Promise<void> {
    await updateDoc(doc(db, 'workouts', workoutId), {
      feedback: {
        difficulty: feedback.difficulty,
        energyLevel: feedback.energyLevel,
        notes: feedback.notes ?? null,
        savedAt: serverTimestamp(),
      }
    })
  },

  // Historial paginado
  async fetchWorkoutsPage(params: {
    userId: string
    pageSize?: number
    lastDoc?: any
  }): Promise<{ workouts: WorkoutSummary[], lastDoc: any }> {
    let q = query(
      collection(db, 'workouts'),
      where('userId', '==', params.userId),
      where('isCompleted', '==', true),
      orderBy('startedAt', 'desc'),
      limit(params.pageSize ?? 10)
    )
    if (params.lastDoc) q = query(q, startAfter(params.lastDoc))

    const snap = await getDocs(q)
    return {
      workouts: snap.docs.map(d => mapWorkoutSummary(d)),
      lastDoc: snap.docs[snap.docs.length - 1] ?? null
    }
  },

  // Detalle completo de un workout
  async fetchWorkoutDetail(workoutId: string): Promise<WorkoutDetail> {
    const [workoutSnap, exercisesSnap] = await Promise.all([
      getDoc(doc(db, 'workouts', workoutId)),
      getDocs(query(
        collection(db, 'workouts', workoutId, 'exercises'),
        orderBy('order', 'asc')
      ))
    ])

    if (!workoutSnap.exists()) throw new Error('Workout not found')

    return mapWorkoutDetail(workoutSnap, exercisesSnap)
  },

  // Última sesión de cada ejercicio (targets/ghost sets)
  async fetchGhostSets(params: {
    userId: string
    exerciseNames: string[]
  }): Promise<Record<string, WorkoutSet[]>> {
    // Para cada ejercicio, busca el último workout completado que lo contenga
    // Query: workouts where userId=uid, isCompleted=true, orderBy startedAt desc
    // Luego filtra ejercicios en cliente
    // Retorna { exerciseName: sets[] }
    const result: Record<string, WorkoutSet[]> = {}

    const workoutsSnap = await getDocs(query(
      collection(db, 'workouts'),
      where('userId', '==', params.userId),
      where('isCompleted', '==', true),
      orderBy('startedAt', 'desc'),
      limit(20)
    ))

    for (const workoutDoc of workoutsSnap.docs) {
      const exercisesSnap = await getDocs(
        collection(db, 'workouts', workoutDoc.id, 'exercises')
      )
      for (const exDoc of exercisesSnap.docs) {
        const name = exDoc.data().name as string
        if (params.exerciseNames.includes(name) && !result[name]) {
          result[name] = exDoc.data().sets as WorkoutSet[]
        }
      }
      if (Object.keys(result).length === params.exerciseNames.length) break
    }

    return result
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    await updateDoc(doc(db, 'workouts', workoutId), { isCompleted: false })
    // Soft delete: marcar como no completado
    // O hard delete si se prefiere
  },
}

// tipos internos
interface FinishedExercise {
  name: string
  nameEs: string | null
  order: number
  exerciseType: string
  notes: string | null
  sets: Array<{
    weight: number | null
    reps: number | null
    completed: boolean
    setType: string
    durationSeconds: number | null
    distanceKm: number | null
    inclinationPercent: number | null
  }>
}
```

---

## Store — Workout Activo (en memoria)

```typescript
// stores/active-workout.store.ts
export const useActiveWorkoutStore = defineStore('activeWorkout', () => {
  const draft = ref<WorkoutDraft | null>(null)
  const ghostSets = ref<Record<string, WorkoutSet[]>>({})
  const elapsedSeconds = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const isActive = computed(() => draft.value !== null)

  function startTimer() {
    timer = setInterval(() => { elapsedSeconds.value++ }, 1000)
  }

  function stopTimer() {
    if (timer) clearInterval(timer)
  }

  async function initWorkout(params: {
    workoutId: string
    name: string
    color: number
    exercises: DraftExercise[]
  }) {
    draft.value = {
      workoutId: params.workoutId,
      workoutName: params.name,
      workoutColor: params.color,
      startedAtMs: Date.now(),
      exercises: params.exercises,
    }
    elapsedSeconds.value = 0
    startTimer()
  }

  function addExercise(exercise: DraftExercise) {
    draft.value?.exercises.push({ ...exercise, order: draft.value.exercises.length })
  }

  function removeExercise(order: number) {
    if (!draft.value) return
    draft.value.exercises = draft.value.exercises
      .filter(e => e.order !== order)
      .map((e, i) => ({ ...e, order: i }))
  }

  function addSet(exerciseOrder: number) {
    const ex = draft.value?.exercises.find(e => e.order === exerciseOrder)
    if (!ex) return
    const last = ex.sets[ex.sets.length - 1]
    ex.sets.push({
      weight: last?.weight ?? '',
      reps: last?.reps ?? '',
      completed: false,
      setType: 'regular',
      durationSeconds: null,
      distanceKm: '',
      inclinationPercent: '',
    })
  }

  function removeSet(exerciseOrder: number, setIndex: number) {
    const ex = draft.value?.exercises.find(e => e.order === exerciseOrder)
    ex?.sets.splice(setIndex, 1)
  }

  function updateSet(exerciseOrder: number, setIndex: number, patch: Partial<DraftSet>) {
    const ex = draft.value?.exercises.find(e => e.order === exerciseOrder)
    if (!ex) return
    ex.sets[setIndex] = { ...ex.sets[setIndex], ...patch }
  }

  function toggleSetCompleted(exerciseOrder: number, setIndex: number) {
    const ex = draft.value?.exercises.find(e => e.order === exerciseOrder)
    if (!ex) return
    ex.sets[setIndex].completed = !ex.sets[setIndex].completed
  }

  function clearDraft() {
    draft.value = null
    elapsedSeconds.value = 0
    stopTimer()
  }

  return {
    draft, ghostSets, elapsedSeconds, isActive,
    initWorkout, addExercise, removeExercise,
    addSet, removeSet, updateSet, toggleSetCompleted,
    clearDraft, startTimer, stopTimer,
  }
})
```

---

## Flujo: Iniciar Workout

```
Usuario pulsa "Iniciar entrenamiento"
  → Modal: nombre + color + ejercicios iniciales (o vacío)
  → workoutService.createWorkout() → workoutId
  → activeWorkoutStore.initWorkout()
  → navigateTo('/train/workout/active')
```

### Desde plantilla

```
Usuario pulsa plantilla
  → workoutService.createWorkout({ name: template.name, color: template.color })
  → Mapear template.exercises → DraftExercise[]
  → Fetch ghost sets para esos ejercicios
  → activeWorkoutStore.initWorkout({ exercises })
  → navigateTo('/train/workout/active')
```

---

## Flujo: Finalizar Workout

```
Usuario pulsa "Terminar"
  → Validar: al menos 1 set completado
  → stopTimer()
  → Modal FeedbackModal (difficulty + energyLevel + notes)
  → workoutService.finishWorkout({ workoutId, exercises, xpEarned })
  → workoutService.saveFeedback()
  → xpService.awardWorkoutXp()     ← award XP + coins
  → prService.checkAndSavePrs()    ← check nuevos PRs
  → feedService.createPost()       ← publicar en feed
  → activeWorkoutStore.clearDraft()
  → navigateTo('/train')
  → Toast "¡Entrenamiento completado! +{xp} XP"
```

---

## UI — Workout Activo (`/train/workout/active`)

### Layout

```
AppBar: [← Cancelar]  "Push Day"  [00:42]  [Terminar →]

─────────────────────────────────

Exercise Card: "Press Banca"
┌─────────────────────────────────┐
│ 💪 Press Banca         [+ Set] │
│                                 │
│ SET  PREV    KG     REPS   ✓   │
│  1   80kg    [80]  [10]   ☐   │
│  2   80kg    [80]  [10]   ✓   │
│  3    —      [ ]   [ ]   ☐   │
│                         [🗑️]  │
└─────────────────────────────────┘

Exercise Card: "Sentadilla"
┌─────────────────────────────────┐
│ ...                             │
└─────────────────────────────────┘

[+ Añadir ejercicio]
```

### ExerciseCard

- Header: nombre ejercicio + botón "+ Set"
- Tabla de series: SET | PREV (ghost) | KG | REPS | ✓
- Set completado: fila resaltada en verde
- Swipe o botón eliminar serie
- Long press en tipo de set → SetTypeSelector (warmup/regular/failed/dropset)
- Nota opcional (expandible debajo del header)

### SetRow tipos

| ExerciseType | Columnas |
|---|---|
| `standard` | KG + REPS |
| `assistedBody` | −KG (asistencia) + REPS |
| `timed` | Cronómetro (play/pause/reset) + botón Manual |
| `cardioDistance` | KM + MIN + INCL% |

### GhostSet (targets)

- La columna PREV muestra el peso/reps de la última sesión
- Si no hay datos previos → "—"
- Tap en PREV → autofill en campos

### WorkoutTimer

- Contador en tiempo real en AppBar
- Formato: `MM:SS` o `HH:MM:SS` si >1h

### FeedbackModal

```
┌───────────────────────────────────┐
│    ¿Cómo fue el entreno?          │
│                                   │
│  Dificultad:                      │
│  [Fácil]  [Media]  [Difícil]      │
│                                   │
│  Energía:                         │
│  ⚡ 1  2  3  4  5                 │
│                                   │
│  Notas (opcional):                │
│  ┌─────────────────────────────┐  │
│  │                             │  │
│  └─────────────────────────────┘  │
│                                   │
│  [ Guardar y terminar ]           │
└───────────────────────────────────┘
```

---

## Cálculo XP al terminar

```typescript
// utils/xp.ts
export function calculateWorkoutXp(params: {
  completedSets: number
  hasPr: boolean
  streakDays: number
}): { xp: number, coins: number } {
  const base = 50
  const streakBonus = Math.min(params.streakDays, 7) // máx +7
  const xp = base + streakBonus

  const coins = 10 + (params.hasPr ? 5 : 0)

  return { xp, coins }
}
```

---

## Historial (`/train/workout/history`)

- Lista paginada (10 por página)
- Cada item: nombre, fecha, duración, ejercicios count
- Tap → `/train/workout/[id]` (detalle)
- "Cargar más" al final de la lista

## Detalle (`/train/workout/[id]`)

- AppBar: nombre + fecha
- Stats: duración, volumen total, series totales
- Lista ejercicios con sets
- Feedback guardado (si existe)

---

## Decisiones técnicas

- Draft vive solo en Pinia (en memoria). Si el usuario recarga la página, se pierde.
- **No** persistir draft en localStorage (complejidad innecesaria para MVP web)
- Workout se crea en Firestore al iniciar (para tener ID antes de terminar)
- XP award es idempotente: usa `lastXpDate` — si Cloud Function ya lo procesó, el cliente lo detecta
- PRs se calculan en cliente (mismo algoritmo que Flutter)
- Post en feed se crea automáticamente al terminar (no es opcional en MVP)
