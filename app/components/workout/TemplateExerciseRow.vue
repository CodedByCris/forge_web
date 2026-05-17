<template>
  <div class="flex items-center gap-2 py-2.5 border-b border-forge-divider last:border-0">
    <div class="flex-1 min-w-0">
      <p class="text-forge-text text-sm font-medium truncate">
        {{ exercise.nameEs ?? exercise.name }}
      </p>
    </div>

    <!-- Sets input -->
    <div class="flex items-center gap-1 shrink-0">
      <input
        type="number"
        :value="exercise.defaultSets"
        @change="onSetsChange"
        min="1"
        max="20"
        class="w-11 bg-forge-surfaceAlt border border-forge-divider rounded-lg px-1.5 py-1 text-center text-sm text-forge-text focus:outline-none focus:border-forge-primary transition-colors"
      />
      <span class="text-forge-muted text-xs w-6">sets</span>
    </div>

    <!-- Reps input -->
    <div class="flex items-center gap-1 shrink-0">
      <input
        type="text"
        :value="exercise.defaultReps"
        @input="onRepsInput"
        placeholder="10"
        maxlength="8"
        class="w-14 bg-forge-surfaceAlt border border-forge-divider rounded-lg px-1.5 py-1 text-center text-sm text-forge-text focus:outline-none focus:border-forge-primary transition-colors"
      />
      <span class="text-forge-muted text-xs w-7">reps</span>
    </div>

    <!-- Delete -->
    <button
      @click="$emit('remove')"
      class="text-forge-muted hover:text-red-400 transition-colors p-1 shrink-0"
    >
      <X :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { PlannedExercise } from '~/types/template'

const props = defineProps<{ exercise: PlannedExercise }>()
const emit = defineEmits<{
  update: [patch: Partial<PlannedExercise>]
  remove: []
}>()

function onSetsChange(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value)
  if (!isNaN(val) && val >= 1 && val <= 20) {
    emit('update', { defaultSets: val })
  }
}

function onRepsInput(e: Event) {
  emit('update', { defaultReps: (e.target as HTMLInputElement).value })
}
</script>
