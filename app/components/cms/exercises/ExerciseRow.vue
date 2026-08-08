<script setup lang="ts">
import type { CmsExercise } from '~/types/cms/exercise'
import { EXERCISE_TYPE_LABELS } from '~/types/cms/exercise'

defineProps<{
  exercise: CmsExercise
}>()
</script>

<template>
  <NuxtLink
    :to="`/cms/ejercicios/${exercise.id}`"
    class="flex items-center gap-4 border-b border-forge-divider px-4 py-3 text-sm hover:bg-forge-surfaceAlt"
  >
    <img
      v-if="exercise.imageUrl"
      :src="exercise.imageUrl"
      :alt="exercise.name"
      class="h-10 w-10 shrink-0 rounded-lg object-cover"
    >
    <div
      v-else
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forge-surfaceAlt text-xs text-forge-muted"
    >
      —
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-forge-text">{{ exercise.name }}</p>
      <p class="truncate text-xs text-forge-muted">
        {{ exercise.bodyParts.join(', ') || '—' }}
      </p>
    </div>

    <span class="shrink-0 text-xs text-forge-muted">{{ EXERCISE_TYPE_LABELS[exercise.exerciseType] }}</span>

    <span
      class="shrink-0 rounded px-2 py-1 text-[10px] uppercase tracking-wide"
      :class="exercise.isActive ? 'bg-forge-success/10 text-forge-success' : 'bg-forge-surfaceAlt text-forge-muted'"
    >
      {{ exercise.isActive ? 'Activo' : 'Inactivo' }}
    </span>
  </NuxtLink>
</template>
