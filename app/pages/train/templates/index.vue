<template>
  <div class="animate-fade-in">
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Plantillas</h1>
        <p class="text-forge-muted text-sm mt-0.5">{{ templates.length }}/5 plantillas</p>
      </div>
      <button
        @click="openCreate"
        :disabled="!canCreateMore"
        :title="!canCreateMore ? 'Límite de 5 plantillas alcanzado' : ''"
        class="gradient-orange text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed glow-orange-hover transition-all text-sm active:scale-[0.97]"
      >
        <Plus :size="16" />
        Nueva
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="h-28 bg-forge-surface border border-forge-divider rounded-2xl animate-pulse"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="templates.length === 0" class="text-center py-20">
      <Dumbbell :size="48" class="mx-auto text-forge-muted mb-4 opacity-40" />
      <h3 class="text-forge-text font-semibold mb-1">Sin plantillas</h3>
      <p class="text-forge-muted text-sm mb-6">Crea tu primera rutina de entrenamiento</p>
      <button
        @click="openCreate"
        class="gradient-orange text-white font-semibold px-6 py-3 rounded-xl text-sm glow-orange-hover transition-all"
      >
        Crear plantilla
      </button>
    </div>

    <!-- Template cards -->
    <div v-else class="space-y-3">
      <WorkoutTemplateCard
        v-for="template in templates"
        :key="template.id"
        :template="template"
        @edit="openEdit"
        @delete="handleDelete"
        @start="handleStart"
      />
    </div>

    <!-- Create / Edit modal -->
    <WorkoutTemplateFormModal
      v-if="showModal"
      :template="editingTemplate ?? undefined"
      @close="closeModal"
      @saved="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Dumbbell } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { workoutService } from '~/services/workout.service'
import type { WorkoutTemplate } from '~/types/template'

definePageMeta({ layout: 'train', middleware: 'auth' })

const authStore = useAuthStore()
const templateStore = useTemplateStore()
const { templates, loading, canCreateMore } = storeToRefs(templateStore)
const { user } = storeToRefs(authStore)

const showModal = ref(false)
const editingTemplate = ref<WorkoutTemplate | null>(null)

onMounted(() => {
  if (user.value) templateStore.subscribe(user.value.id)
})

onUnmounted(() => {
  templateStore.unsubscribe()
})

function openCreate() {
  editingTemplate.value = null
  showModal.value = true
}

function openEdit(template: WorkoutTemplate) {
  editingTemplate.value = template
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingTemplate.value = null
}

async function handleDelete(id: string) {
  if (!confirm('¿Eliminar esta plantilla?')) return
  await templateStore.deleteTemplate(user.value!.id, id)
}

async function handleStart(template: WorkoutTemplate) {
  const workoutStore = useActiveWorkoutStore()

  const workoutId = await workoutService.createWorkout({
    userId: user.value!.id,
    name: template.name,
    color: template.color,
  })

  const exerciseNames = template.exercises.map((e) => e.name)
  const ghostSets = exerciseNames.length
    ? await workoutService.fetchGhostSets({ userId: user.value!.id, exerciseNames })
    : {}

  workoutStore.initWorkout({
    workoutId,
    name: template.name,
    color: template.color,
    exercises: template.exercises.map((e) => ({
      name: e.name,
      nameEs: e.nameEs,
      order: e.order,
      exerciseId: e.exerciseId,
      bodyParts: e.bodyParts,
      defaultSets: e.defaultSets,
      defaultReps: e.defaultReps,
      note: '',
      exerciseType: e.exerciseType,
      sets: Array.from({ length: e.defaultSets }, () => ({
        weight: '',
        reps: '',
        completed: false,
        setType: 'regular' as const,
        durationSeconds: null,
        distanceKm: '',
        inclinationPercent: '',
      })),
    })),
  })

  workoutStore.ghostSets = ghostSets
  await navigateTo('/train/workout/active')
}
</script>
