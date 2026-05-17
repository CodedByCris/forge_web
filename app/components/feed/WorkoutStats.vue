<template>
  <div class="grid grid-cols-3 gap-2">
    <div class="bg-forge-surfaceAlt rounded-xl px-3 py-2.5 text-center">
      <p class="text-forge-text font-bold text-base leading-tight">{{ formatDuration(durationSeconds) }}</p>
      <p class="text-forge-muted text-xs mt-0.5">Duración</p>
    </div>
    <div class="bg-forge-surfaceAlt rounded-xl px-3 py-2.5 text-center">
      <p class="text-forge-text font-bold text-base leading-tight">
        {{ totalVolumeKg > 0 ? `${totalVolumeKg.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg` : '—' }}
      </p>
      <p class="text-forge-muted text-xs mt-0.5">Volumen</p>
    </div>
    <div class="bg-forge-surfaceAlt rounded-xl px-3 py-2.5 text-center">
      <p class="font-bold text-base leading-tight" :class="prsCount > 0 ? 'text-forge-accent' : 'text-forge-text'">
        {{ prsCount > 0 ? `🏆 ${prsCount}` : '—' }}
      </p>
      <p class="text-forge-muted text-xs mt-0.5">PRs</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDuration } from '~/utils/xp'

defineProps<{
  durationSeconds: number
  totalVolumeKg: number
  prsCount: number
}>()
</script>
