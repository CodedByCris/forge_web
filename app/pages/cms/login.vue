<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useCmsAuthStore } from '~/stores/cms/auth.store'

definePageMeta({ layout: false })

const authStore = useCmsAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleSubmit() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    await navigateTo('/cms')
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-forge-bg px-4">
    <div class="w-full max-w-sm rounded-2xl border border-forge-divider bg-forge-surface p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-forge-text">
          Forge <span class="text-forge-primary">CMS</span>
        </h1>
        <p class="mt-2 text-sm text-forge-muted">Acceso restringido a administradores</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="username"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2.5 text-sm text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Contraseña
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2.5 pr-10 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-forge-muted"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <p v-if="authStore.error" class="text-sm text-forge-danger">
          {{ authStore.error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full rounded-lg bg-forge-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forge-accent disabled:opacity-60"
        >
          {{ authStore.loading ? 'Entrando…' : 'Iniciar sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>
