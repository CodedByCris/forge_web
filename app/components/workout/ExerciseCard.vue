<template>
  <div class="bg-forge-surface border border-forge-divider rounded-2xl overflow-hidden">
    <!-- Card header -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-forge-divider">
      <div class="flex-1 min-w-0">
        <p class="font-bold text-forge-text truncate">
          {{ exercise.nameEs ?? exercise.name }}
        </p>
      </div>

      <!-- Note toggle -->
      <button
        @click="showNote = !showNote"
        class="p-1.5 rounded-lg transition-colors"
        :class="exercise.note ? 'text-forge-accent' : 'text-forge-muted hover:text-forge-textSec'"
        title="Nota"
      >
        <StickyNote :size="15" />
      </button>

      <!-- Add set -->
      <button
        @click="workoutStore.addSet(exercise.order)"
        class="flex items-center gap-1 text-xs font-semibold text-forge-primary hover:text-forge-accent transition-colors px-2 py-1.5 rounded-lg hover:bg-forge-primary/10"
      >
        <Plus :size="14" />
        Set
      </button>

      <!-- Remove exercise -->
      <button
        @click="$emit('remove')"
        class="p-1.5 text-forge-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
        title="Eliminar ejercicio"
      >
        <Trash2 :size="15" />
      </button>
    </div>

    <!-- Note textarea (expandable) -->
    <Transition name="slide">
      <div v-if="showNote" class="px-4 py-2 border-b border-forge-divider bg-forge-bg">
        <textarea
          :value="exercise.note"
          @input="workoutStore.updateNote(exercise.order, ($event.target as HTMLTextAreaElement).value)"
          placeholder="Nota del ejercicio..."
          rows="2"
          class="w-full bg-transparent text-sm text-forge-text placeholder-forge-muted focus:outline-none resize-none"
        />
      </div>
    </Transition>

    <!-- Sets table -->
    <div class="px-3 py-2">
      <!-- Column headers -->
      <div
        class="grid items-center gap-1.5 px-1 pb-1"
        :class="headerGridClass"
      >
        <span class="text-forge-muted text-[10px] uppercase font-semibold text-center">SET</span>
        <span
          v-if="exercise.exerciseType !== 'cardioDistance'"
          class="text-forge-muted text-[10px] uppercase font-semibold text-center"
        >
          PREV
        </span>
        <span
          v-for="col in dataCols"
          :key="col"
          class="text-forge-muted text-[10px] uppercase font-semibold text-center"
        >
          {{ col }}
        </span>
        <span class="text-forge-muted text-[10px] uppercase font-semibold text-center">✓</span>
      </div>

      <!-- Set rows -->
      <WorkoutSetRow
        v-for="(set, idx) in exercise.sets"
        :key="idx"
        :exercise-order="exercise.order"
        :set-index="idx"
        :set="set"
        :ghost-set="ghostSets?.[idx]"
        :exercise-type="exercise.exerciseType"
      />

      <!-- Remove last set (only if > 1 set) -->
      <div v-if="exercise.sets.length > 1" class="flex justify-end pt-1">
        <button
          @click="workoutStore.removeSet(exercise.order, exercise.sets.length - 1)"
          class="text-xs text-forge-muted hover:text-red-400 transition-colors flex items-center gap-1 py-1 px-2"
        >
          <Minus :size="12" />
          Quitar última serie
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Trash2, StickyNote, Minus } from 'lucide-vue-next'
import type { DraftExercise, WorkoutSet } from '~/types/workout'

const props = defineProps<{
  exercise: DraftExercise
  ghostSets: WorkoutSet[] | undefined
}>()

defineEmits<{ remove: [] }>()

const workoutStore = useActiveWorkoutStore()
const showNote = ref(!!props.exercise.note)

const headerGridClass = computed(() => {
  switch (props.exercise.exerciseType) {
    case 'cardioDistance':
      return 'grid-cols-[1.75rem_1fr_1fr_1fr_1.75rem]'
    default:
      return 'grid-cols-[1.75rem_3rem_1fr_1fr_1.75rem]'
  }
})

const dataCols = computed(() => {
  switch (props.exercise.exerciseType) {
    case 'standard': return ['KG', 'REPS']
    case 'assistedBody': return ['-KG', 'REPS']
    case 'timed': return ['SEG', '']
    case 'cardioDistance': return ['KM', 'MIN', 'INCL%']
    default: return ['KG', 'REPS']
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 100px;
  opacity: 1;
}
</style>
