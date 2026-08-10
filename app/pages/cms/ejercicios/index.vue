<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCmsExercisesStore } from '~/stores/cms/exercises.store'
import ExerciseRow from '~/components/cms/exercises/ExerciseRow.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import { BODY_PART_LABELS, BODY_PARTS, EXERCISE_TYPE_LABELS, type CmsExerciseType } from '~/types/cms/exercise'

definePageMeta({ layout: 'cms' })

const exercisesStore = useCmsExercisesStore()

const bodyPartFilter = ref<string>('')
const exerciseTypeFilter = ref<CmsExerciseType | ''>('')
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')

onMounted(() => {
  exercisesStore.fetchAll()
})

// Todo el catálogo (~1396 docs) vive en memoria (exercisesStore.exercises) —
// búsqueda por nombre y filtros se resuelven aquí, sin más queries.
const filteredExercises = computed(() => {
  const term = exercisesStore.searchTerm.trim().toLowerCase()
  return exercisesStore.exercises.filter((ex) => {
    if (term && !ex.name.toLowerCase().includes(term)) return false
    if (bodyPartFilter.value && !ex.bodyParts.includes(bodyPartFilter.value)) return false
    if (exerciseTypeFilter.value && ex.exerciseType !== exerciseTypeFilter.value) return false
    if (activeFilter.value === 'active' && !ex.isActive) return false
    if (activeFilter.value === 'inactive' && ex.isActive) return false
    return true
  })
})
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-forge-text">Ejercicios</h1>
      <div class="flex flex-wrap gap-2">
        <select
          v-model="bodyPartFilter"
          class="rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
          <option value="">Todos los grupos</option>
          <option v-for="part in BODY_PARTS" :key="part" :value="part">{{ BODY_PART_LABELS[part] }}</option>
        </select>
        <select
          v-model="exerciseTypeFilter"
          class="rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
          <option value="">Todos los tipos</option>
          <option v-for="(label, key) in EXERCISE_TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
        <select
          v-model="activeFilter"
          class="rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <input
          v-model="exercisesStore.searchTerm"
          type="text"
          placeholder="Buscar por nombre…"
          class="w-56 rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-primary"
        >
        <button
          type="button"
          :disabled="exercisesStore.loading"
          class="rounded-lg border border-forge-divider px-3 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt disabled:opacity-60"
          @click="exercisesStore.fetchAll(true)"
        >
          {{ exercisesStore.loading ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <p v-if="!exercisesStore.loading" class="mb-4 text-xs text-forge-muted">
      {{ filteredExercises.length }} de {{ exercisesStore.exercises.length }} ejercicios
    </p>

    <EmptyState
      v-if="exercisesStore.error"
      title="No se pudieron cargar los ejercicios"
      :description="exercisesStore.error"
    />

    <div v-else-if="exercisesStore.loading && exercisesStore.exercises.length === 0" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <EmptyState
      v-else-if="filteredExercises.length === 0"
      title="Sin resultados"
    />

    <div v-else class="overflow-hidden rounded-xl border border-forge-divider">
      <ExerciseRow
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        :exercise="exercise"
      />
    </div>
  </div>
</template>
