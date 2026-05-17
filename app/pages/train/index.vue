<template>
  <div class="animate-fade-in">
    <!-- Greeting -->
    <div class="mb-8">
      <p class="text-forge-muted text-sm">Bienvenido de vuelta</p>
      <h1 class="text-2xl font-bold mt-0.5">
        {{ profile?.nickname ?? user?.email }}
      </h1>
    </div>

    <!-- XP / Level card -->
    <div v-if="profile" class="bg-forge-surface border border-forge-divider rounded-2xl p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-forge-muted text-xs uppercase tracking-widest font-medium">Nivel</p>
          <p class="text-3xl font-black text-forge-text">{{ level }}</p>
        </div>
        <div class="text-right">
          <p class="text-forge-muted text-xs uppercase tracking-widest font-medium">XP Total</p>
          <p class="text-lg font-bold text-forge-accent">{{ profile.totalXp.toLocaleString() }}</p>
        </div>
      </div>
      <!-- XP progress bar -->
      <div class="h-2 bg-forge-surfaceAlt rounded-full overflow-hidden">
        <div
          class="h-full gradient-orange rounded-full transition-all duration-700"
          :style="{ width: `${xpProgressPct}%` }"
        />
      </div>
      <p class="text-forge-muted text-xs mt-1.5 text-right">
        {{ xpInLevel }} / 100 XP para nivel {{ level + 1 }}
      </p>
    </div>

    <!-- Quick actions -->
    <div class="space-y-3">
      <button
        class="w-full gradient-orange text-white font-bold py-4 rounded-2xl text-base glow-orange-hover transition-all active:scale-[0.98]"
      >
        Iniciar entrenamiento
      </button>
      <button
        class="w-full bg-forge-surface text-forge-text font-semibold py-4 rounded-2xl border border-forge-divider hover:border-forge-primary/40 transition-colors active:scale-[0.98]"
      >
        Ver plantillas
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'train', middleware: 'auth' })

const { user, profile } = storeToRefs(useAuthStore())

const level = computed(() => Math.floor((profile.value?.totalXp ?? 0) / 100))
const xpInLevel = computed(() => (profile.value?.totalXp ?? 0) % 100)
const xpProgressPct = computed(() => xpInLevel.value)
</script>
