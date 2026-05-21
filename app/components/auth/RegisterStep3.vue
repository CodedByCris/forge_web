<template>
  <div class="text-center animate-scale-in space-y-6">
    <!-- Icon -->
    <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style="background: rgba(255,98,0,0.15)">
      <CheckCircle2 :size="40" class="text-forge-primary" />
    </div>

    <div>
      <h2 class="text-2xl font-black text-forge-text mb-2">¡Cuenta lista!</h2>
      <p class="text-forge-muted text-sm">Descarga la app para entrenar desde tu móvil.</p>
    </div>

    <!-- App store buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a
        href="https://play.google.com/store"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 bg-forge-surface border border-forge-divider hover:border-forge-primary/40 text-forge-text font-medium py-3 px-5 rounded-xl transition-colors text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.18 15.64a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zm11.64 0a2.18 2.18 0 0 1-2.18-2.18V9.5a2.18 2.18 0 0 1 4.36 0v3.96a2.18 2.18 0 0 1-2.18 2.18zM3.56 8.04C3.56 5.38 7.44 3 12 3s8.44 2.38 8.44 5.04v8.6c0 .7-.57 1.27-1.27 1.27h-.5v2.27a1.82 1.82 0 0 1-3.64 0V16.9H8.97v2.27a1.82 1.82 0 0 1-3.64 0V16.9h-.5c-.7 0-1.27-.57-1.27-1.27v-8.6zM9.5 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm5 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
        </svg>
        Google Play
      </a>
      <a
        href="https://apps.apple.com"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 bg-forge-surface border border-forge-divider hover:border-forge-primary/40 text-forge-text font-medium py-3 px-5 rounded-xl transition-colors text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        App Store
      </a>
    </div>

    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-forge-divider" />
      </div>
      <div class="relative flex justify-center text-xs">
        <span class="bg-forge-bg px-3 text-forge-muted">o continúa aquí</span>
      </div>
    </div>

    <button
      type="button"
      @click="$emit('go-to-dashboard')"
      class="w-full gradient-orange text-white font-bold py-4 rounded-xl text-base transition-all glow-orange-hover active:scale-[0.98]"
    >
      Ir a mi dashboard
    </button>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

defineEmits<{ 'go-to-dashboard': [] }>()
</script>
