<script setup lang="ts">
import { ref } from 'vue'
import { useCmsUsersStore } from '~/stores/cms/users.store'

const props = defineProps<{
  open: boolean
  uid: string
}>()

const emit = defineEmits<{
  close: []
}>()

const usersStore = useCmsUsersStore()

const deltaXp = ref(0)
const deltaCoins = ref(0)
const loading = ref(false)
const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

async function handleConfirm() {
  loading.value = true
  feedback.value = null
  const ok = await usersStore.adjustXpCoins(props.uid, deltaXp.value, deltaCoins.value)
  loading.value = false
  if (ok) {
    feedback.value = { type: 'success', message: 'XP y coins actualizados.' }
    deltaXp.value = 0
    deltaCoins.value = 0
    setTimeout(() => emit('close'), 1000)
  } else {
    feedback.value = {
      type: 'error',
      message: 'No se pudo aplicar el cambio. Revisa que las Firestore rules ya permitan esta acción.',
    }
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div class="w-full max-w-sm rounded-2xl border border-forge-divider bg-forge-surface p-6">
      <h2 class="text-lg font-semibold text-forge-text">Ajustar XP / coins</h2>

      <div class="mt-4 space-y-4">
        <div>
          <label for="delta-xp" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Delta XP (puede ser negativo)
          </label>
          <input
            id="delta-xp"
            v-model.number="deltaXp"
            type="number"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>
        <div>
          <label for="delta-coins" class="mb-1.5 block text-xs font-medium text-forge-textSec">
            Delta coins (puede ser negativo)
          </label>
          <input
            id="delta-coins"
            v-model.number="deltaCoins"
            type="number"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
        </div>
      </div>

      <p
        v-if="feedback"
        class="mt-4 text-sm"
        :class="feedback.type === 'success' ? 'text-forge-success' : 'text-forge-danger'"
      >
        {{ feedback.message }}
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="loading || (deltaXp === 0 && deltaCoins === 0)"
          class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
          @click="handleConfirm"
        >
          {{ loading ? 'Aplicando…' : 'Aplicar' }}
        </button>
      </div>
    </div>
  </div>
</template>
