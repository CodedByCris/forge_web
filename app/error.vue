<template>
  <div class="min-h-screen bg-forge-bg flex flex-col items-center justify-center px-4 text-center">
    <!-- Code -->
    <p class="text-8xl font-black text-gradient-orange mb-2 tabular-nums">
      {{ error.statusCode }}
    </p>

    <!-- Title -->
    <h1 class="text-2xl font-bold text-forge-text mb-2">
      {{ title }}
    </h1>

    <!-- Message -->
    <p class="text-forge-muted text-sm max-w-sm mb-10">
      {{ message }}
    </p>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        @click="handleError"
        class="gradient-orange text-white font-bold px-6 py-3 rounded-xl glow-orange-hover transition-all active:scale-[0.97]"
      >
        Volver al inicio
      </button>
      <button
        v-if="error.statusCode >= 500"
        @click="reloadPage"
        class="bg-forge-surface border border-forge-divider text-forge-text font-semibold px-6 py-3 rounded-xl hover:border-forge-primary/40 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const title = computed(() => {
  switch (props.error.statusCode) {
    case 404: return 'Página no encontrada'
    case 403: return 'Sin acceso'
    case 500: return 'Error del servidor'
    default: return 'Algo salió mal'
  }
})

const message = computed(() => {
  if (props.error.message && !props.error.message.includes('Error:')) {
    return props.error.message
  }
  switch (props.error.statusCode) {
    case 404: return 'La página que buscas no existe o ha sido movida.'
    case 403: return 'No tienes permisos para ver esta página.'
    case 500: return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
    default: return 'Ocurrió un error inesperado.'
  }
})

function handleError() {
  clearError({ redirect: '/' })
}

function reloadPage() {
  clearError()
  window.location.reload()
}
</script>
