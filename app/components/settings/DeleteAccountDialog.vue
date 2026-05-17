<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-5" @click.self="emit('close')">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="emit('close')" />

      <div class="relative bg-forge-surface border border-forge-divider rounded-2xl p-6 w-full max-w-sm animate-scale-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle :size="20" class="text-red-400" />
          </div>
          <div>
            <h3 class="text-forge-text font-bold">Eliminar cuenta</h3>
            <p class="text-forge-muted text-xs mt-0.5">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p class="text-forge-textSec text-sm mb-5 leading-relaxed">
          Se eliminarán todos tus datos: entrenamientos, plantillas, progresión y perfil. Confirma con tu contraseña.
        </p>

        <input
          v-model="password"
          type="password"
          placeholder="Tu contraseña"
          class="w-full bg-forge-surfaceAlt border border-forge-divider rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-red-500/60 transition-colors mb-4"
          @keyup.enter="handleDelete"
        />

        <p v-if="error" class="text-red-400 text-xs mb-3">{{ error }}</p>

        <div class="flex gap-3">
          <button
            @click="emit('close')"
            class="flex-1 py-3 rounded-xl border border-forge-divider text-forge-muted hover:text-forge-text hover:border-forge-primary/40 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="!password || loading"
            class="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Loader2 v-if="loading" :size="15" class="animate-spin" />
            <span>{{ loading ? 'Eliminando…' : 'Eliminar' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, Loader2 } from 'lucide-vue-next'
import { profileService } from '~/services/profile.service'

const emit = defineEmits<{ close: []; deleted: [] }>()

const password = ref('')
const loading = ref(false)
const error = ref('')

const authStore = useAuthStore()

async function handleDelete() {
  if (!password.value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    await profileService.deleteAccount(password.value)
    await authStore.signOut()
    emit('deleted')
    await navigateTo('/train/auth/login')
  } catch (e: unknown) {
    const code = (e as { code?: string }).code
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      error.value = 'Contraseña incorrecta'
    } else {
      error.value = 'Error al eliminar la cuenta'
    }
  } finally {
    loading.value = false
  }
}
</script>
