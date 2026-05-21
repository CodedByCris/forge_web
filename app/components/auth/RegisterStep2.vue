<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Username -->
    <div>
      <label class="block text-forge-textSec text-sm font-medium mb-2">Nombre de usuario</label>
      <div class="relative">
        <input
          v-model="nickname"
          type="text"
          autocomplete="username"
          placeholder="tu_nombre"
          maxlength="30"
          class="w-full bg-forge-surface border rounded-xl px-4 py-3 pr-10 text-forge-text placeholder-forge-muted focus:outline-none transition-colors"
          :class="errors.nickname ? 'border-red-500 focus:border-red-500' : 'border-forge-divider focus:border-forge-primary'"
        />
        <span v-if="checkingNickname" class="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 :size="16" class="animate-spin text-forge-muted" />
        </span>
      </div>
      <p v-if="errors.nickname" class="text-red-400 text-xs mt-1.5">{{ errors.nickname }}</p>
    </div>

    <!-- Objetivo -->
    <div>
      <label class="block text-forge-textSec text-sm font-medium mb-2">Objetivo</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="opt in objectives"
          :key="opt.value"
          type="button"
          @click="buildType = opt.value"
          class="py-3 px-3 rounded-xl border text-sm font-medium transition-all"
          :class="buildType === opt.value
            ? 'border-forge-primary bg-forge-primary/10 text-forge-primary'
            : 'border-forge-divider bg-forge-surface text-forge-textSec hover:border-forge-primary/40'"
        >
          {{ opt.label }}
        </button>
      </div>
      <p v-if="errors.buildType" class="text-red-400 text-xs mt-1.5">{{ errors.buildType }}</p>
    </div>

    <!-- Submit -->
    <button
      type="button"
      :disabled="isSubmitting"
      @click="handleSubmit"
      class="w-full gradient-orange text-white font-bold py-4 rounded-xl text-base transition-all glow-orange-hover disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
    >
      <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
      <span>{{ isSubmitting ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { UserBuildType } from '~/types/user'
import { profileService } from '~/services/profile.service'

const emit = defineEmits<{ submit: [nickname: string, buildType: UserBuildType] }>()

const objectives: Array<{ label: string; value: UserBuildType }> = [
  { label: 'Ganar músculo', value: 'bodybuilder' },
  { label: 'Perder grasa', value: 'athlete' },
  { label: 'Mantenimiento', value: 'hybrid' },
  { label: 'Rendimiento', value: 'powerlifter' },
]

const nickname = ref('')
const buildType = ref<UserBuildType | null>(null)
const checkingNickname = ref(false)
const isSubmitting = ref(false)
const errors = ref({ nickname: '', buildType: '' })

async function handleSubmit() {
  errors.value = { nickname: '', buildType: '' }
  let valid = true

  if (!nickname.value.trim()) {
    errors.value.nickname = 'El nombre de usuario es requerido'
    valid = false
  } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(nickname.value.trim())) {
    errors.value.nickname = 'Solo letras, números y _ (3-30 caracteres)'
    valid = false
  }

  if (!buildType.value) {
    errors.value.buildType = 'Selecciona un objetivo'
    valid = false
  }

  if (!valid) return

  isSubmitting.value = true
  checkingNickname.value = true

  try {
    const available = await profileService.checkNicknameAvailable(nickname.value.trim())
    if (!available) {
      errors.value.nickname = 'Este nombre ya está en uso'
      return
    }
    emit('submit', nickname.value.trim(), buildType.value!)
  } catch {
    errors.value.nickname = 'Error al verificar disponibilidad'
  } finally {
    checkingNickname.value = false
    isSubmitting.value = false
  }
}
</script>
