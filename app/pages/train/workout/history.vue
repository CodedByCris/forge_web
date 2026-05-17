<template>
  <div class="animate-fade-in">
    <h1 class="text-2xl font-bold mb-6">Historial</h1>

    <!-- Loading skeleton -->
    <div v-if="isLoading && workouts.length === 0" class="space-y-3">
      <div
        v-for="i in 5"
        :key="i"
        class="h-20 bg-forge-surface border border-forge-divider rounded-2xl animate-pulse"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="workouts.length === 0" class="text-center py-20">
      <Dumbbell :size="48" class="mx-auto text-forge-muted mb-4 opacity-40" />
      <p class="text-forge-text font-semibold">Sin entrenamientos</p>
      <p class="text-forge-muted text-sm mt-1">Aquí aparecerán tus entrenamientos completados</p>
    </div>

    <!-- Workout list -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="workout in workouts"
        :key="workout.id"
        :to="`/train/workout/${workout.id}`"
        class="flex items-center gap-3 bg-forge-surface border border-forge-divider rounded-2xl px-4 py-3.5 hover:border-forge-primary/30 transition-colors group"
      >
        <!-- Color dot -->
        <div
          class="w-3 h-3 rounded-full shrink-0"
          :style="{ background: argbToHex(workout.color) }"
        />

        <div class="flex-1 min-w-0">
          <p class="font-semibold text-forge-text truncate">{{ workout.name }}</p>
          <p class="text-forge-muted text-xs mt-0.5">{{ formatDate(workout.startedAt) }}</p>
        </div>

        <div class="text-right shrink-0">
          <p v-if="workout.xpEarned" class="text-forge-xp text-sm font-semibold">
            +{{ workout.xpEarned }} XP
          </p>
          <ChevronRight :size="16" class="text-forge-muted group-hover:text-forge-text transition-colors ml-auto mt-0.5" />
        </div>
      </NuxtLink>

      <!-- Load more -->
      <button
        v-if="hasMore"
        @click="loadMore"
        :disabled="isLoading"
        class="w-full py-3 text-forge-muted hover:text-forge-text text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Loader2 v-if="isLoading" :size="16" class="animate-spin" />
        {{ isLoading ? 'Cargando...' : 'Cargar más' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dumbbell, ChevronRight, Loader2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { workoutService } from '~/services/workout.service'
import { argbToHex } from '~/utils/colors'
import type { WorkoutSummary } from '~/types/workout'
import type { DocumentSnapshot } from 'firebase/firestore'

definePageMeta({ layout: 'train', middleware: 'auth' })

const { user } = storeToRefs(useAuthStore())

const workouts = ref<WorkoutSummary[]>([])
const isLoading = ref(false)
const hasMore = ref(true)
let lastDoc: DocumentSnapshot | null = null

async function fetchPage() {
  if (!user.value || isLoading.value) return
  isLoading.value = true
  try {
    const result = await workoutService.fetchWorkoutsPage({
      userId: user.value.id,
      lastDoc: lastDoc ?? undefined,
    })
    workouts.value.push(...result.workouts)
    lastDoc = result.lastDoc
    hasMore.value = result.workouts.length === 10
  } finally {
    isLoading.value = false
  }
}

function loadMore() {
  fetchPage()
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

onMounted(() => fetchPage())
</script>
