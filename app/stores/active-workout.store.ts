import { defineStore } from 'pinia'
import type { DraftExercise, DraftSet, WorkoutDraft, WorkoutSet } from '~/types/workout'

export const useActiveWorkoutStore = defineStore('activeWorkout', () => {
  const draft = ref<WorkoutDraft | null>(null)
  const ghostSets = ref<Record<string, WorkoutSet[]>>({})
  const elapsedSeconds = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const isActive = computed(() => draft.value !== null)

  const completedSetsCount = computed(() => {
    if (!draft.value) return 0
    return draft.value.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.completed).length,
      0,
    )
  })

  function startTimer(): void {
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      elapsedSeconds.value++
    }, 1000)
  }

  function stopTimer(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function initWorkout(params: {
    workoutId: string
    name: string
    color: number
    exercises: DraftExercise[]
  }): void {
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

  function addExercise(exercise: DraftExercise): void {
    if (!draft.value) return
    draft.value.exercises.push({
      ...exercise,
      order: draft.value.exercises.length,
    })
  }

  function removeExercise(order: number): void {
    if (!draft.value) return
    draft.value.exercises = draft.value.exercises
      .filter((e) => e.order !== order)
      .map((e, i) => ({ ...e, order: i }))
  }

  function addSet(exerciseOrder: number): void {
    const ex = draft.value?.exercises.find((e) => e.order === exerciseOrder)
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

  function removeSet(exerciseOrder: number, setIndex: number): void {
    const ex = draft.value?.exercises.find((e) => e.order === exerciseOrder)
    ex?.sets.splice(setIndex, 1)
  }

  function updateSet(
    exerciseOrder: number,
    setIndex: number,
    patch: Partial<DraftSet>,
  ): void {
    const ex = draft.value?.exercises.find((e) => e.order === exerciseOrder)
    if (!ex) return
    ex.sets[setIndex] = { ...ex.sets[setIndex], ...patch }
  }

  function toggleSetCompleted(exerciseOrder: number, setIndex: number): void {
    const ex = draft.value?.exercises.find((e) => e.order === exerciseOrder)
    if (!ex) return
    ex.sets[setIndex].completed = !ex.sets[setIndex].completed
  }

  function updateNote(exerciseOrder: number, note: string): void {
    const ex = draft.value?.exercises.find((e) => e.order === exerciseOrder)
    if (ex) ex.note = note
  }

  function clearDraft(): void {
    stopTimer()
    draft.value = null
    elapsedSeconds.value = 0
    ghostSets.value = {}
  }

  return {
    draft,
    ghostSets,
    elapsedSeconds,
    isActive,
    completedSetsCount,
    initWorkout,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetCompleted,
    updateNote,
    clearDraft,
    startTimer,
    stopTimer,
  }
})
