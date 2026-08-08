<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-sm rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">{{ title }}</h2>
      <p class="mt-2 text-sm text-forge-textSec">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="emit('cancel')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="loading"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="emit('confirm')"
        >
          {{ loading ? 'Aplicando…' : (confirmLabel ?? 'Confirmar') }}
        </button>
      </div>
    </div>
  </div>
</template>
