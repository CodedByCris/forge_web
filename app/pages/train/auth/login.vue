<template>
  <div class="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-4">
    <!-- Logo -->
    <div class="mb-10 text-center animate-scale-in">
      <img src="/icon.png" alt="Forge" class="w-16 h-16 mx-auto mb-4 rounded-2xl" />
      <h1 class="text-3xl font-black text-gradient-orange tracking-tight">FORGE</h1>
      <p class="text-forge-muted text-sm mt-1">Accede a tu entrenamiento</p>
    </div>

    <!-- Form -->
    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-sm space-y-4 animate-fade-in"
    >
      <!-- Email -->
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

      <!-- Password -->
      <div>
        <label class="block text-forge-textSec text-sm font-medium mb-2">Contraseña</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
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

      <!-- Auth error -->
      <Transition name="fade">
        <div
          v-if="authError"
          class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
        >
          <p class="text-red-400 text-sm">{{ authError }}</p>
        </div>
      </Transition>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full gradient-orange text-white font-bold py-4 rounded-xl text-base transition-all glow-orange-hover disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
        <span>{{ isSubmitting ? 'Entrando...' : 'Iniciar sesión' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: false, middleware: 'auth' })

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const authError = ref('')
const errors = ref({ email: '', password: '' })

function validate(): boolean {
  errors.value = { email: '', password: '' }
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

  return valid
}

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-email': 'Email inválido',
  'auth/invalid-credential': 'Credenciales incorrectas',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet',
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  authError.value = ''

  try {
    await authStore.signIn(email.value.trim(), password.value)
    await navigateTo('/train')
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    authError.value = FIREBASE_ERRORS[code] ?? 'Error al iniciar sesión'
  } finally {
    isSubmitting.value = false
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
