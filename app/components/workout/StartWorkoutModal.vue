<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      @click.self="$emit('close')"
    >
      <div class="fixed inset-0 bg-black/60" @click="$emit('close')" />

      <div
        class="relative w-full sm:max-w-sm bg-forge-bg border border-forge-divider rounded-t-2xl sm:rounded-2xl px-5 py-6 animate-scale-in"
      >
        <h2 class="font-bold text-lg mb-5">Nuevo entrenamiento</h2>

        <!-- Name -->
        <div class="mb-5">
          <label class="block text-forge-textSec text-sm font-medium mb-2">Nombre</label>
          <input
            v-model="name"
            type="text"
            maxlength="50"
            placeholder="Ej: Push Day, Full Body..."
            autofocus
            class="w-full bg-forge-surface border border-forge-divider rounded-xl px-4 py-3 text-forge-text placeholder-forge-muted focus:outline-none focus:border-forge-primary transition-colors"
            :class="{ 'border-red-500': nameError }"
            @keydown.enter="start"
          />
          <p v-if="nameError" class="text-red-400 text-xs mt-1.5">{{ nameError }}</p>
        </div>

        <!-- Color -->
        <div class="mb-6">
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

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 py-3 rounded-xl border border-forge-divider text-forge-text font-medium hover:bg-forge-surface transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            @click="start"
            :disabled="isStarting"
            class="flex-1 py-3 rounded-xl gradient-orange text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2 text-sm glow-orange-hover transition-all"
          >
            <Loader2 v-if="isStarting" :size="16" class="animate-spin" />
            {{ isStarting ? 'Iniciando...' : 'Empezar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Check, Loader2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { TEMPLATE_COLORS, argbToHex } from '~/utils/colors'
import { workoutService } from '~/services/workout.service'

const emit = defineEmits<{ close: []; started: [] }>()

const { user } = storeToRefs(useAuthStore())
const workoutStore = useActiveWorkoutStore()

const name = ref('')
const selectedColor = ref<number>(TEMPLATE_COLORS[0])
const nameError = ref('')
const isStarting = ref(false)

async function start() {
  nameError.value = ''
  if (!name.value.trim()) {
    nameError.value = 'El nombre es requerido'
    return
  }

  isStarting.value = true
  try {
    const workoutId = await workoutService.createWorkout({
      userId: user.value!.id,
      name: name.value.trim(),
      color: selectedColor.value,
    })

    workoutStore.initWorkout({
      workoutId,
      name: name.value.trim(),
      color: selectedColor.value,
      exercises: [],
    })

    emit('started')
    await navigateTo('/train/workout/active')
  } catch {
    nameError.value = 'Error al iniciar. Inténtalo de nuevo'
  } finally {
    isStarting.value = false
  }
}
</script>
