<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      @click.self="$emit('close')"
    >
      <div class="fixed inset-0 bg-black/60" @click="$emit('close')" />

      <!-- Modal panel -->
      <div
        class="relative w-full sm:max-w-lg bg-forge-bg border border-forge-divider rounded-t-2xl sm:rounded-2xl flex flex-col animate-scale-in"
        style="max-height: 90dvh"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-forge-divider shrink-0">
          <h2 class="font-bold text-forge-text text-lg">
            {{ isEdit ? 'Editar plantilla' : 'Nueva plantilla' }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-forge-muted hover:text-forge-text transition-colors p-1 -mr-1"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Body (scrollable) -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <!-- Name -->
          <div>
            <label class="block text-forge-textSec text-sm font-medium mb-2">
              Nombre de la plantilla
            </label>
            <input
              v-model="name"
              type="text"
              maxlength="50"
              placeholder="Ej: Push Day, Piernas..."
              class="w-full bg-forge-surface border border-forge-divider rounded-xl px-4 py-3 text-forge-text placeholder-forge-muted focus:outline-none focus:border-forge-primary transition-colors"
              :class="{ 'border-red-500': nameError }"
            />
            <p v-if="nameError" class="text-red-400 text-xs mt-1.5">{{ nameError }}</p>
          </div>

          <!-- Color picker -->
          <div>
            <label class="block text-forge-textSec text-sm font-medium mb-3">Color</label>
            <div class="flex gap-3 flex-wrap">
              <button
                v-for="color in TEMPLATE_COLORS"
                :key="color"
                @click="selectedColor = color"
                class="w-9 h-9 rounded-full transition-transform duration-150 flex items-center justify-center"
                :style="{ background: argbToHex(color) }"
                :class="selectedColor === color ? 'scale-110 ring-2 ring-white/60' : 'hover:scale-105'"
              >
                <Check v-if="selectedColor === color" :size="14" class="text-white drop-shadow" />
              </button>
            </div>
          </div>

          <!-- Exercises -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-forge-textSec text-sm font-medium">Ejercicios</label>
              <span class="text-forge-muted text-xs">{{ exercises.length }}</span>
            </div>

            <!-- Exercise list -->
            <div
              v-if="exercises.length > 0"
              class="bg-forge-surface border border-forge-divider rounded-xl px-3 mb-3"
            >
              <WorkoutTemplateExerciseRow
                v-for="(exercise, idx) in exercises"
                :key="idx"
                :exercise="exercise"
                @update="(patch) => updateExercise(idx, patch)"
                @remove="removeExercise(idx)"
              />
            </div>

            <p v-if="exercisesError" class="text-red-400 text-xs mb-2">{{ exercisesError }}</p>

            <!-- Add exercise button -->
            <button
              @click="showAddExercise = true"
              class="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-forge-divider rounded-xl text-forge-muted hover:text-forge-text hover:border-forge-primary/50 transition-colors text-sm"
            >
              <Plus :size="16" />
              Añadir ejercicio
            </button>
          </div>

          <!-- General error -->
          <Transition name="fade">
            <div
              v-if="generalError"
              class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
            >
              <p class="text-red-400 text-sm">{{ generalError }}</p>
            </div>
          </Transition>
        </div>

        <!-- Footer -->
        <div class="px-5 pb-5 pt-4 border-t border-forge-divider shrink-0 flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 py-3 rounded-xl border border-forge-divider text-forge-text font-medium hover:bg-forge-surface transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            @click="save"
            :disabled="isSaving"
            class="flex-1 py-3 rounded-xl gradient-orange text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm glow-orange-hover transition-all"
          >
            <Loader2 v-if="isSaving" :size="16" class="animate-spin" />
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Exercise Modal (nested, higher z-index) -->
    <WorkoutAddExerciseModal
      v-if="showAddExercise"
      @select="onExerciseSelected"
      @close="showAddExercise = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { X, Check, Plus, Loader2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import type { WorkoutTemplate, PlannedExercise } from '~/types/template'
import type { ExerciseEntity } from '~/types/exercise'
import { TEMPLATE_COLORS, argbToHex } from '~/utils/colors'

const props = defineProps<{
  template?: WorkoutTemplate
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { user } = storeToRefs(useAuthStore())
const templateStore = useTemplateStore()

const name = ref('')
const selectedColor = ref<number>(TEMPLATE_COLORS[0])
const exercises = ref<PlannedExercise[]>([])
const showAddExercise = ref(false)
const isSaving = ref(false)
const nameError = ref('')
const exercisesError = ref('')
const generalError = ref('')

const isEdit = computed(() => !!props.template)

// Initialize form with template data (edit) or defaults (create)
watch(
  () => props.template,
  (t) => {
    if (t) {
      name.value = t.name
      selectedColor.value = t.color
      exercises.value = t.exercises.map((e) => ({ ...e }))
    } else {
      name.value = ''
      selectedColor.value = TEMPLATE_COLORS[0]
      exercises.value = []
    }
    nameError.value = ''
    exercisesError.value = ''
    generalError.value = ''
  },
  { immediate: true },
)

function onExerciseSelected(exercise: ExerciseEntity) {
  showAddExercise.value = false
  exercises.value.push({
    name: exercise.name,
    nameEs: exercise.nameEs,
    order: exercises.value.length,
    defaultSets: 3,
    defaultReps: '10',
    exerciseId: exercise.id,
    bodyParts: exercise.bodyParts,
    exerciseType: exercise.exerciseType,
  })
  exercisesError.value = ''
}

function removeExercise(idx: number) {
  exercises.value.splice(idx, 1)
  exercises.value.forEach((e, i) => { e.order = i })
}

function updateExercise(idx: number, patch: Partial<PlannedExercise>) {
  exercises.value[idx] = { ...exercises.value[idx], ...patch }
}

function validate(): boolean {
  nameError.value = ''
  exercisesError.value = ''
  let valid = true

  if (!name.value.trim()) {
    nameError.value = 'El nombre es requerido'
    valid = false
  }
  if (exercises.value.length === 0) {
    exercisesError.value = 'Añade al menos un ejercicio'
    valid = false
  }

  return valid
}

async function save() {
  if (!validate()) return

  isSaving.value = true
  generalError.value = ''

  const params = {
    name: name.value.trim(),
    color: selectedColor.value,
    exercises: exercises.value,
  }

  try {
    if (props.template) {
      await templateStore.updateTemplate(user.value!.id, props.template.id, params)
    } else {
      await templateStore.createTemplate(user.value!.id, params)
    }
    emit('saved')
  } catch (e: unknown) {
    if ((e as Error).message === 'max_templates') {
      generalError.value = 'Límite de 5 plantillas alcanzado'
    } else {
      generalError.value = 'Error al guardar. Inténtalo de nuevo'
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
