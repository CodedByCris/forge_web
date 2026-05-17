<template>
  <div class="flex flex-col items-center justify-center py-20 text-center px-6">
    <div class="w-16 h-16 rounded-2xl bg-forge-surface border border-forge-divider flex items-center justify-center mb-4">
      <Users :size="28" class="text-forge-muted" />
    </div>
    <p class="text-forge-text font-semibold text-lg mb-2">Sin actividad aún</p>
    <p class="text-forge-muted text-sm leading-relaxed max-w-xs">
      Completa un entrenamiento y aparecerá aquí. Pronto podrás seguir a otros usuarios.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Users } from 'lucide-vue-next'
</script>
