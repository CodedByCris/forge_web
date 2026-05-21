<template>
  <div class="space-y-4 animate-fade-in">
    <div>
      <label class="block text-forge-textSec text-sm font-medium mb-2">Email</label>
      <input
        v-model="email"
        type="email"
        autocomplete="email"
        placeholder="tu@email.com"
        class="w-full bg-forge-surface border rounded-xl px-4 py-3 text-forge-text placeholder-forge-muted focus:outline-none transition-colors"
        :class="errors.email ? 'border-red-500 focus:border-red-500' : 'border-forge-divider focus:border-forge-primary'"
      />
      <p v-if="errors.email" class="text-red-400 text-xs mt-1.5">{{ errors.email }}</p>
    </div>

    <div>
      <label class="block text-forge-textSec text-sm font-medium mb-2">Contraseña</label>
      <div class="relative">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="••••••••"
          class="w-full bg-forge-surface border rounded-xl px-4 py-3 pr-12 text-forge-text placeholder-forge-muted focus:outline-none transition-colors"
          :class="errors.password ? 'border-red-500 focus:border-red-500' : 'border-forge-divider focus:border-forge-primary'"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-forge-muted hover:text-forge-textSec transition-colors p-1"
          tabindex="-1"
        >
          <EyeOff v-if="showPassword" :size="18" />
          <Eye v-else :size="18" />
        </button>
      </div>
      <p v-if="errors.password" class="text-red-400 text-xs mt-1.5">{{ errors.password }}</p>
    </div>

    <div>
      <label class="block text-forge-textSec text-sm font-medium mb-2">Repetir contraseña</label>
      <div class="relative">
        <input
          v-model="confirm"
          :type="showConfirm ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="••••••••"
          class="w-full bg-forge-surface border rounded-xl px-4 py-3 pr-12 text-forge-text placeholder-forge-muted focus:outline-none transition-colors"
          :class="errors.confirm ? 'border-red-500 focus:border-red-500' : 'border-forge-divider focus:border-forge-primary'"
        />
        <button
          type="button"
          @click="showConfirm = !showConfirm"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-forge-muted hover:text-forge-textSec transition-colors p-1"
          tabindex="-1"
        >
          <EyeOff v-if="showConfirm" :size="18" />
          <Eye v-else :size="18" />
        </button>
      </div>
      <p v-if="errors.confirm" class="text-red-400 text-xs mt-1.5">{{ errors.confirm }}</p>
    </div>

    <button
      type="button"
      @click="handleNext"
      class="w-full gradient-orange text-white font-bold py-4 rounded-xl text-base transition-all glow-orange-hover disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
    >
      Siguiente
      <ArrowRight :size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, ArrowRight } from 'lucide-vue-next'

const emit = defineEmits<{ next: [email: string, password: string] }>()

const email = ref('')
const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const errors = ref({ email: '', password: '', confirm: '' })

function handleNext() {
  errors.value = { email: '', password: '', confirm: '' }
  let valid = true

  if (!email.value) {
    errors.value.email = 'El email es requerido'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Email inválido'
    valid = false
  }

  if (!password.value) {
    errors.value.password = 'La contraseña es requerida'
    valid = false
  } else if (password.value.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres'
    valid = false
  }

  if (!confirm.value) {
    errors.value.confirm = 'Repite la contraseña'
    valid = false
  } else if (confirm.value !== password.value) {
    errors.value.confirm = 'Las contraseñas no coinciden'
    valid = false
  }

  if (valid) emit('next', email.value.trim(), password.value)
}
</script>
