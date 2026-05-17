<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-60 flex flex-col bg-forge-bg"
      @keydown.esc="$emit('close')"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 pt-safe-top py-4 border-b border-forge-divider bg-forge-surface shrink-0">
        <button
          @click="$emit('close')"
          class="text-forge-muted hover:text-forge-text transition-colors p-1 -ml-1"
        >
          <X :size="20" />
        </button>
        <h2 class="font-bold text-forge-text text-lg flex-1">Añadir ejercicio</h2>
      </div>

      <!-- Search -->
      <div class="px-4 py-3 border-b border-forge-divider shrink-0">
        <div class="relative">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-forge-muted pointer-events-none" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar ejercicio..."
            autofocus
            class="w-full bg-forge-surface border border-forge-divider rounded-xl pl-9 pr-4 py-2.5 text-forge-text placeholder-forge-muted focus:outline-none focus:border-forge-primary transition-colors text-sm"
          />
        </div>
      </div>

      <!-- Muscle filter chips -->
      <div class="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-forge-divider shrink-0">
        <button
          @click="selectedMuscle = null"
          class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
          :class="selectedMuscle === null
            ? 'bg-forge-primary text-white'
            : 'bg-forge-surface border border-forge-divider text-forge-muted hover:text-forge-text'"
        >
          Todo
        </button>
        <button
          v-for="muscle in availableMuscles"
          :key="muscle"
          @click="selectedMuscle = selectedMuscle === muscle ? null : muscle"
          class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
          :class="selectedMuscle === muscle
            ? 'bg-forge-primary text-white'
            : 'bg-forge-surface border border-forge-divider text-forge-muted hover:text-forge-text'"
        >
          {{ MUSCLE_LABELS[muscle] }}
        </button>
      </div>

      <!-- Exercise list -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <Loader2 :size="28" class="animate-spin text-forge-muted" />
        </div>

        <!-- Empty -->
        <div v-else-if="filteredExercises.length === 0" class="text-center py-16">
          <p class="text-forge-muted text-sm">Sin resultados</p>
        </div>

        <!-- List -->
        <div v-else>
          <button
            v-for="exercise in filteredExercises"
            :key="exercise.id"
            @click="$emit('select', exercise)"
            class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-forge-divider hover:bg-forge-surface transition-colors text-left"
          >
            <div class="flex-1 min-w-0">
              <p class="text-forge-text text-sm font-medium truncate">
                {{ exercise.nameEs ?? exercise.name }}
              </p>
              <p class="text-forge-muted text-xs mt-0.5 truncate">
                {{ exercise.bodyParts.map(b => MUSCLE_LABELS[b]).join(' · ') }}
              </p>
            </div>
            <Plus :size="18" class="text-forge-primary shrink-0" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Search, Loader2, Plus } from 'lucide-vue-next'
import { exerciseService } from '~/services/exercise.service'
import type { ExerciseEntity, MuscleGroup } from '~/types/exercise'
import { MUSCLE_LABELS } from '~/types/exercise'

const emit = defineEmits<{
  select: [exercise: ExerciseEntity]
  close: []
}>()

const allExercises = ref<ExerciseEntity[]>([])
const searchQuery = ref('')
const selectedMuscle = ref<MuscleGroup | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    allExercises.value = await exerciseService.fetchAll()
  } finally {
    isLoading.value = false
  }
})

const availableMuscles = computed<MuscleGroup[]>(() => {
  const set = new Set<MuscleGroup>()
  allExercises.value.forEach((e) => e.bodyParts.forEach((m) => set.add(m)))
  return [...set].sort()
})

const filteredExercises = computed(() => {
  let list = allExercises.value

  if (selectedMuscle.value) {
    list = list.filter((e) => e.bodyParts.includes(selectedMuscle.value!))
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.nameEs?.toLowerCase().includes(q) ?? false),
    )
  }

  return list
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.z-60 {
  z-index: 60;
}
</style>
