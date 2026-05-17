<template>
  <div class="min-h-screen bg-forge-bg text-forge-text">
    <!-- AppBar -->
    <header class="sticky top-0 z-30 bg-forge-surface/90 backdrop-blur-md border-b border-forge-divider">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <button
          @click="handleCancel"
          class="text-forge-muted hover:text-forge-text transition-colors text-sm font-medium shrink-0"
        >
          Cancelar
        </button>

        <div class="flex-1 text-center overflow-hidden">
          <p class="font-bold text-sm truncate leading-tight">{{ draft?.workoutName }}</p>
          <WorkoutWorkoutTimer :seconds="elapsedSeconds" />
        </div>

        <button
          @click="handleFinish"
          class="gradient-orange text-white font-bold px-4 py-2 rounded-xl text-sm shrink-0 glow-orange-hover transition-all active:scale-[0.97]"
        >
          Terminar
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-24">
      <!-- Exercise cards -->
      <WorkoutExerciseCard
        v-for="exercise in draft?.exercises"
        :key="exercise.order"
        :exercise="exercise"
        :ghost-sets="ghostSets[exercise.name]"
        @remove="workoutStore.removeExercise(exercise.order)"
      />

      <!-- Add exercise -->
      <button
        @click="showAddExercise = true"
        class="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-forge-divider rounded-2xl text-forge-muted hover:text-forge-text hover:border-forge-primary/40 transition-colors text-sm font-medium"
      >
        <Plus :size="18" />
        Añadir ejercicio
      </button>
    </div>

    <!-- Add exercise modal -->
    <WorkoutAddExerciseModal
      v-if="showAddExercise"
      @select="onExerciseAdded"
      @close="showAddExercise = false"
    />

    <!-- Feedback modal -->
    <WorkoutFeedbackModal
      v-if="showFeedback"
      :saving="isFinishing"
      @save="onFeedbackSave"
    />

    <SharedToastContainer />
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { workoutService } from '~/services/workout.service'
import { xpService } from '~/services/xp.service'
import { feedService } from '~/services/feed.service'
import { calculateWorkoutXp, calcTotalVolumeKg } from '~/utils/xp'
import type { WorkoutFeedback } from '~/types/workout'
import type { ExerciseEntity } from '~/types/exercise'

definePageMeta({ layout: false, middleware: 'auth' })

const { user, profile } = storeToRefs(useAuthStore())
const workoutStore = useActiveWorkoutStore()
const { draft, ghostSets, elapsedSeconds } = storeToRefs(workoutStore)
const { show: showToast } = useToast()

const showAddExercise = ref(false)
const showFeedback = ref(false)
const isFinishing = ref(false)

// Redirect if no active workout
onMounted(() => {
  if (!draft.value) navigateTo('/train')
})

// Warn before leaving if workout in progress
onBeforeRouteLeave((to) => {
  if (draft.value && to.path !== '/train') {
    const confirmed = confirm('¿Abandonar el entrenamiento? Se perderá el progreso no guardado.')
    if (!confirmed) return false
    workoutStore.clearDraft()
  }
})

function onExerciseAdded(exercise: ExerciseEntity) {
  showAddExercise.value = false
  workoutStore.addExercise({
    name: exercise.name,
    nameEs: exercise.nameEs,
    order: 0,
    exerciseId: exercise.id,
    bodyParts: exercise.bodyParts,
    defaultSets: 3,
    defaultReps: '10',
    note: '',
    exerciseType: exercise.exerciseType,
    sets: Array.from({ length: 3 }, () => ({
      weight: '',
      reps: '',
      completed: false,
      setType: 'regular' as const,
      durationSeconds: null,
      distanceKm: '',
      inclinationPercent: '',
    })),
  })

  // Fetch ghost sets for new exercise
  if (user.value) {
    workoutService
      .fetchGhostSets({ userId: user.value.id, exerciseNames: [exercise.name] })
      .then((result) => {
        ghostSets.value = { ...ghostSets.value, ...result }
      })
  }
}

function handleCancel() {
  if (!draft.value) return navigateTo('/train')

  const hasCompleted = workoutStore.completedSetsCount > 0
  if (hasCompleted) {
    if (!confirm('¿Cancelar el entrenamiento? Se perderá el progreso.')) return
  }

  workoutStore.clearDraft()
  navigateTo('/train')
}

function handleFinish() {
  if (workoutStore.completedSetsCount === 0) {
    showToast('Completa al menos una serie antes de terminar', 'error')
    return
  }
  workoutStore.stopTimer()
  showFeedback.value = true
}

async function onFeedbackSave(feedback: WorkoutFeedback) {
  if (!draft.value || !user.value) return
  isFinishing.value = true

  try {
    const { xp, coins } = calculateWorkoutXp({
      completedSets: workoutStore.completedSetsCount,
      hasPr: false,
      streakDays: 0,
    })

    const exercises = draft.value.exercises.map((ex) => ({
      name: ex.name,
      nameEs: ex.nameEs,
      order: ex.order,
      exerciseType: ex.exerciseType,
      notes: ex.note || null,
      sets: ex.sets.map((s) => ({
        weight: parseFloat(s.weight) || null,
        reps: parseInt(s.reps) || null,
        completed: s.completed,
        setType: s.setType,
        durationSeconds: s.durationSeconds,
        distanceKm: parseFloat(s.distanceKm) || null,
        inclinationPercent: parseFloat(s.inclinationPercent) || null,
      })),
    }))

    const workoutId = draft.value.workoutId
    const workoutName = draft.value.workoutName
    const durationSeconds = elapsedSeconds.value
    const totalVolumeKg = Math.round(calcTotalVolumeKg(draft.value.exercises))

    await workoutService.finishWorkout({ workoutId, exercises, xpEarned: xp })
    await workoutService.saveFeedback(workoutId, feedback)

    // Award XP (idempotent — CF may win the race)
    await xpService.awardWorkoutXp(user.value.id, xp, coins)

    // Create feed post
    await feedService.createWorkoutPost({
      userId: user.value.id,
      userNickname: profile.value?.nickname ?? '',
      userPhotoUrl: profile.value?.photoUrl ?? null,
      workoutId,
      workoutName,
      durationSeconds,
      totalVolumeKg,
      prsCount: 0,
      exercisesPreview: draft.value.exercises.slice(0, 4).map((ex) => ({
        name: ex.name,
        nameEs: ex.nameEs,
        sets: ex.sets.filter((s) => s.completed).length,
        reps: ex.defaultReps,
      })),
    })

    workoutStore.clearDraft()
    showToast(`¡Entrenamiento completado! +${xp} XP`, 'success')
    await navigateTo('/train')
  } catch {
    showToast('Error al guardar el entrenamiento. Inténtalo de nuevo', 'error')
    workoutStore.startTimer()
    isFinishing.value = false
    showFeedback.value = false
  }
}
</script>
