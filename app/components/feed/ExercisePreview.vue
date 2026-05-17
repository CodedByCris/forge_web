<template>
  <div class="space-y-1">
    <div
      v-for="ex in visibleExercises"
      :key="ex.name"
      class="flex items-center justify-between text-sm"
    >
      <span class="text-forge-textSec truncate">{{ ex.nameEs ?? ex.name }}</span>
      <span class="text-forge-muted flex-shrink-0 ml-3">{{ ex.sets }}×{{ ex.reps }}</span>
    </div>
    <button
      v-if="exercises.length > MAX_VISIBLE"
      @click="expanded = !expanded"
      class="text-forge-muted text-xs hover:text-forge-text transition-colors mt-1"
    >
      {{ expanded ? 'Ver menos' : `+${exercises.length - MAX_VISIBLE} más` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ExercisePreview } from '~/types/feed'

const props = defineProps<{ exercises: ExercisePreview[] }>()

const MAX_VISIBLE = 3
const expanded = ref(false)

const visibleExercises = computed(() =>
  expanded.value ? props.exercises : props.exercises.slice(0, MAX_VISIBLE),
)
</script>
