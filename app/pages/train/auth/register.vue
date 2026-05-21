<template>
  <div class="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-4">
    <!-- Logo -->
    <div class="mb-8 text-center animate-scale-in">
      <img src="/icon.png" alt="Forge" class="w-16 h-16 mx-auto mb-4 rounded-2xl" />
      <h1 class="text-3xl font-black text-gradient-orange tracking-tight">FORGE</h1>
      <p class="text-forge-muted text-sm mt-1">Crea tu cuenta gratis</p>
    </div>

    <!-- Step indicators -->
    <div class="flex items-center gap-2 mb-8">
      <div
        v-for="n in 3"
        :key="n"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="[
          n <= step ? 'bg-forge-primary' : 'bg-forge-divider',
          n === step ? 'w-8' : 'w-4',
        ]"
      />
    </div>

    <!-- Step label -->
    <p class="text-forge-muted text-xs uppercase tracking-widest mb-6">
      {{ stepLabels[step - 1] }}
    </p>

    <!-- Form -->
    <div class="w-full max-w-sm">
      <!-- Auth error -->
      <Transition name="fade">
        <div
          v-if="authError"
          class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4"
        >
          <p class="text-red-400 text-sm">{{ authError }}</p>
        </div>
      </Transition>

      <AuthRegisterStep1 v-if="step === 1" @next="onStep1Next" />
      <AuthRegisterStep2 v-else-if="step === 2" @submit="onStep2Submit" />
      <AuthRegisterStep3 v-else @go-to-dashboard="navigateTo('/train')" />
    </div>

    <!-- Login link -->
    <p v-if="step < 3" class="text-center text-forge-muted text-sm mt-8">
      ¿Ya tienes cuenta?
      <NuxtLink to="/train/auth/login" class="text-forge-primary hover:text-forge-accent transition-colors">
        Inicia sesión
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { UserBuildType } from '~/types/user'
import { authService } from '~/services/auth.service'
import { profileService } from '~/services/profile.service'

definePageMeta({ layout: false, middleware: 'auth' })

const authStore = useAuthStore()

const step = ref(1)
const authError = ref('')

const stepLabels = ['Paso 1 de 3 — Cuenta', 'Paso 2 de 3 — Perfil', 'Paso 3 de 3 — ¡Listo!']

let pendingEmail = ''
let pendingPassword = ''

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Este email ya tiene una cuenta',
  'auth/invalid-email': 'Email inválido',
  'auth/weak-password': 'La contraseña es demasiado débil',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet',
}

function onStep1Next(email: string, password: string) {
  pendingEmail = email
  pendingPassword = password
  step.value = 2
  authError.value = ''
}

async function onStep2Submit(nickname: string, buildType: UserBuildType) {
  authError.value = ''

  try {
    const firebaseUser = await authService.createUser(pendingEmail, pendingPassword)

    await profileService.createProfile(firebaseUser.uid, {
      nickname,
      email: pendingEmail,
      buildType,
    })

    const profile = await profileService.fetchProfile(firebaseUser.uid)
    authStore.$patch({ user: { id: firebaseUser.uid, email: pendingEmail }, profile })

    step.value = 3
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    authError.value = FIREBASE_ERRORS[code] ?? 'Error al crear la cuenta'
    step.value = 2
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
