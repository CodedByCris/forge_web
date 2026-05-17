<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div class="fixed inset-0 bg-black/70" />
      <div
        class="relative w-full sm:max-w-md bg-forge-bg border border-forge-divider rounded-t-2xl sm:rounded-2xl px-6 py-6 animate-scale-in"
      >
        <h2 class="text-xl font-bold text-center mb-6">¿Cómo fue el entreno?</h2>

        <!-- Difficulty -->
        <div class="mb-6">
          <p class="text-forge-muted text-sm font-medium mb-3">Dificultad</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="d in DIFFICULTIES"
              :key="d.value"
              @click="difficulty = d.value"
              class="py-2.5 rounded-xl text-sm font-semibold border transition-all"
              :class="difficulty === d.value ? d.activeClass : 'border-forge-divider text-forge-muted hover:border-forge-divider/80'"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <!-- Energy level -->
        <div class="mb-6">
          <p class="text-forge-muted text-sm font-medium mb-3">Nivel de energía</p>
          <div class="flex gap-2 justify-center">
            <button
              v-for="n in 5"
              :key="n"
              @click="energyLevel = n"
              class="w-11 h-11 rounded-xl text-lg transition-all border"
              :class="n <= energyLevel
                ? 'bg-forge-primary border-forge-primary text-white scale-105'
                : 'border-forge-divider text-forge-muted hover:border-forge-primary/40'"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-6">
          <p class="text-forge-muted text-sm font-medium mb-2">Notas (opcional)</p>
          <textarea
            v-model="notes"
            placeholder="¿Algo a destacar del entreno?"
            rows="3"
            class="w-full bg-forge-surface border border-forge-divider rounded-xl px-4 py-3 text-forge-text placeholder-forge-muted focus:outline-none focus:border-forge-primary transition-colors text-sm resize-none"
          />
        </div>

        <!-- Save button -->
        <button
          @click="save"
          :disabled="saving"
          class="w-full gradient-orange text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 glow-orange-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="saving" :size="18" class="animate-spin" />
          {{ saving ? 'Guardando...' : 'Guardar y terminar' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { WorkoutFeedback, WorkoutDifficulty } from '~/types/workout'

defineProps<{ saving: boolean }>()

const emit = defineEmits<{
  save: [feedback: WorkoutFeedback]
}>()

const difficulty = ref<WorkoutDifficulty>('medium')
const energyLevel = ref(3)
const notes = ref('')

const DIFFICULTIES: {
  value: WorkoutDifficulty
  label: string
  activeClass: string
}[] = [
  { value: 'easy', label: 'Fácil', activeClass: 'bg-green-500/20 border-green-500 text-green-400' },
  {
    value: 'medium',
    label: 'Media',
    activeClass: 'bg-amber-500/20 border-amber-500 text-amber-400',
  },
  { value: 'hard', label: 'Difícil', activeClass: 'bg-red-500/20 border-red-500 text-red-400' },
]

function save() {
  emit('save', {
    difficulty: difficulty.value,
    energyLevel: energyLevel.value,
    notes: notes.value.trim() || null,
  })
}
</script>
