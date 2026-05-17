<template>
  <div class="animate-fade-in">
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-24 bg-forge-surface border border-forge-divider rounded-2xl animate-pulse" />
      <div
        v-for="i in 3"
        :key="i"
        class="h-36 bg-forge-surface border border-forge-divider rounded-2xl animate-pulse"
      />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <p class="text-forge-muted">{{ error }}</p>
      <NuxtLink to="/train/workout/history" class="text-forge-primary text-sm mt-3 block">
        Volver al historial
      </NuxtLink>
    </div>

    <template v-else-if="workout">
      <!-- Header card -->
      <div class="bg-forge-surface border border-forge-divider rounded-2xl p-4 mb-4">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h1 class="text-xl font-bold flex items-center gap-2">
              <span
                class="w-3 h-3 rounded-full inline-block shrink-0"
                :style="{ background: argbToHex(workout.color) }"
              />
              {{ workout.name }}
            </h1>
            <p class="text-forge-muted text-sm mt-1">{{ formatDate(workout.startedAt) }}</p>
          </div>
          <div v-if="workout.xpEarned" class="text-forge-xp font-bold text-lg">
            +{{ workout.xpEarned }} XP
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-forge-divider">
          <div class="text-center">
            <p class="text-forge-text font-bold text-lg">{{ formatDuration(durationSeconds) }}</p>
            <p class="text-forge-muted text-xs">Duración</p>
          </div>
          <div class="text-center">
            <p class="text-forge-text font-bold text-lg">{{ workout.exercises.length }}</p>
            <p class="text-forge-muted text-xs">Ejercicios</p>
          </div>
          <div class="text-center">
            <p class="text-forge-text font-bold text-lg">{{ totalSets }}</p>
            <p class="text-forge-muted text-xs">Series</p>
          </div>
        </div>
      </div>

      <!-- Exercise list -->
      <div class="space-y-3 mb-4">
        <div
          v-for="exercise in workout.exercises"
          :key="exercise.id"
          class="bg-forge-surface border border-forge-divider rounded-2xl overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-forge-divider">
            <p class="font-bold text-forge-text">{{ exercise.nameEs ?? exercise.name }}</p>
            <p v-if="exercise.notes" class="text-forge-muted text-xs mt-0.5">{{ exercise.notes }}</p>
          </div>

          <div class="px-4 py-2 space-y-1">
            <div
              v-for="(set, i) in exercise.sets"
              :key="i"
              class="flex items-center gap-3 py-1.5 text-sm rounded-lg px-1"
              :class="set.completed ? 'text-forge-text' : 'text-forge-muted opacity-60'"
            >
              <span class="text-xs font-semibold w-5 text-center">{{ set.setNumber }}</span>
              <span class="flex-1">
                <template v-if="set.weight !== null && set.reps !== null">
                  {{ set.weight }} kg × {{ set.reps }} reps
                </template>
                <template v-else-if="set.durationSeconds !== null">
                  {{ set.durationSeconds }}s
                </template>
                <template v-else-if="set.distanceKm !== null">
                  {{ set.distanceKm }} km
                </template>
                <template v-else>—</template>
              </span>
              <Check v-if="set.completed" :size="14" class="text-forge-success" />
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback card (if exists) -->
      <div
        v-if="workout.feedback"
        class="bg-forge-surface border border-forge-divider rounded-2xl p-4"
      >
        <!-- feedback is available via raw data from Firestore, type it as any here -->
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { workoutService } from '~/services/workout.service'
import { argbToHex } from '~/utils/colors'
import { formatDuration } from '~/utils/xp'
import type { WorkoutDetail } from '~/types/workout'

definePageMeta({ layout: 'train', middleware: 'auth' })

const route = useRoute()
const workoutId = route.params.id as string

const workout = ref<WorkoutDetail | null>(null)
const isLoading = ref(true)
const error = ref('')

const durationSeconds = computed(() => {
  if (!workout.value?.endedAt || !workout.value.startedAt) return 0
  return Math.floor((workout.value.endedAt.getTime() - workout.value.startedAt.getTime()) / 1000)
})

const totalSets = computed(() =>
  workout.value?.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0) ?? 0,
)

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

onMounted(async () => {
  try {
    workout.value = await workoutService.fetchWorkoutDetail(workoutId)
  } catch {
    error.value = 'No se encontró el entrenamiento'
  } finally {
    isLoading.value = false
  }
})
</script>
