<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCmsConfigStore } from '~/stores/cms/config.store'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'

const configStore = useCmsConfigStore()

const draft = ref(configStore.minVersion)
const showConfirm = ref(false)

watch(() => configStore.minVersion, (v) => { draft.value = v })

// Formato X.Y.Z (igual que `version:` de pubspec.yaml, sin el build number). Vacío = desactivado.
const isValid = computed(() => draft.value.trim() === '' || /^\d+(\.\d+){0,2}$/.test(draft.value.trim()))

async function handleConfirm() {
  await configStore.saveMinVersion(draft.value.trim())
  showConfirm.value = false
}
</script>

<template>
  <div class="mt-10">
    <h2 class="mb-1.5 text-sm font-semibold text-forge-text">Actualización forzada (Android)</h2>
    <p class="mb-3 text-xs text-forge-muted">
      Versión mínima de la app (minVersion, ej. 1.7.0). Los dispositivos Android con
      una versión inferior verán un aviso bloqueante con botón a Play Store. Deja
      el campo vacío para desactivarlo.
    </p>
    <div class="flex gap-2">
      <input
        v-model="draft"
        type="text"
        placeholder="1.7.0"
        aria-label="Versión mínima"
        class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
      >
      <button
        type="button"
        :disabled="!isValid || draft.trim() === configStore.minVersion || configStore.saving"
        class="shrink-0 rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
        @click="showConfirm = true"
      >
        Guardar
      </button>
    </div>
    <p v-if="!isValid" class="mt-2 text-sm text-forge-danger">Formato inválido. Usa X.Y.Z.</p>
    <p v-if="configStore.saveError" class="mt-2 text-sm text-forge-danger">{{ configStore.saveError }}</p>

    <ConfirmModal
      :open="showConfirm"
      title="Guardar versión mínima"
      message="Los dispositivos Android con una versión inferior quedarán bloqueados hasta que actualicen. ¿Continuar?"
      confirm-label="Guardar"
      :loading="configStore.saving"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>
