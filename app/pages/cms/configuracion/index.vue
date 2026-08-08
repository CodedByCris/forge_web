<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCmsConfigStore } from '~/stores/cms/config.store'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'

definePageMeta({ layout: 'cms' })

const configStore = useCmsConfigStore()

const draft = ref('')
const showConfirm = ref(false)

onMounted(async () => {
  await configStore.fetchConfig()
  draft.value = configStore.exercisesCacheKey
})

function useTodayAsValue() {
  draft.value = new Date().toISOString().slice(0, 10)
}

function askSave() {
  if (draft.value.trim() === '') return
  showConfirm.value = true
}

async function handleConfirm() {
  await configStore.save(draft.value.trim())
  showConfirm.value = false
}
</script>

<template>
  <div class="max-w-xl">
    <h1 class="mb-6 text-xl font-bold text-forge-text">Configuración</h1>

    <EmptyState
      v-if="configStore.error"
      title="No se pudo cargar la configuración"
      :description="configStore.error"
    />

    <div v-else-if="configStore.loading" class="text-sm text-forge-muted">
      Cargando…
    </div>

    <div v-else class="space-y-4">
      <div>
        <label for="cache-key" class="mb-1.5 block text-xs font-medium text-forge-textSec">
          Cache de ejercicios (exercisesCacheKey)
        </label>
        <p class="mb-2 text-xs text-forge-muted">
          Cambiar este valor hace que todos los dispositivos recarguen el
          catálogo de ejercicios la próxima vez que abran la app.
        </p>
        <div class="flex gap-2">
          <input
            id="cache-key"
            v-model="draft"
            type="text"
            class="w-full rounded-lg border border-forge-divider bg-forge-surfaceAlt px-3 py-2 text-sm text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-primary"
          >
          <button
            type="button"
            class="shrink-0 rounded-lg border border-forge-divider px-3 py-2 text-sm text-forge-textSec hover:bg-forge-surfaceAlt"
            @click="useTodayAsValue"
          >
            Usar fecha de hoy
          </button>
        </div>
      </div>

      <p v-if="configStore.saveError" class="text-sm text-forge-danger">
        {{ configStore.saveError }}
      </p>

      <button
        type="button"
        :disabled="draft.trim() === '' || configStore.saving"
        class="rounded-lg bg-forge-primary px-4 py-2 text-sm font-semibold text-white hover:bg-forge-accent disabled:opacity-60"
        @click="askSave"
      >
        Guardar
      </button>
    </div>

    <ConfirmModal
      :open="showConfirm"
      title="Guardar configuración"
      message="Todos los dispositivos recargarán el catálogo de ejercicios la próxima vez que abran la app. ¿Continuar?"
      confirm-label="Guardar"
      :loading="configStore.saving"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>
