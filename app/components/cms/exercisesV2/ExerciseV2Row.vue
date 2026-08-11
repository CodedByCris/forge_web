<script setup lang="ts">
import type { CmsExerciseV2 } from '~/types/cms/exerciseV2'
import { BODY_PART_LABELS, EQUIPMENT_LABELS, EXERCISE_TYPE_LABELS } from '~/types/cms/exercise'

defineProps<{
  exercise: CmsExerciseV2
}>()
</script>

<template>
  <NuxtLink
    :to="`/cms/ejercicios-v2/${exercise.id}`"
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
        {{ exercise.bodyParts.map((p) => BODY_PART_LABELS[p as keyof typeof BODY_PART_LABELS] ?? p).join(', ') || '—' }}
      </p>
      <p class="truncate text-xs text-forge-primary">
        {{ exercise.equipmentOptions.map((e) => EQUIPMENT_LABELS[e as keyof typeof EQUIPMENT_LABELS] ?? e).join(', ') || 'Sin equipamiento' }}
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
