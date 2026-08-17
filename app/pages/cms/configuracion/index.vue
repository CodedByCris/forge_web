<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Camera, Trash2, Loader2 } from 'lucide-vue-next'
import { useCmsConfigStore } from '~/stores/cms/config.store'
import ConfirmModal from '~/components/cms/shared/ConfirmModal.vue'
import EmptyState from '~/components/cms/shared/EmptyState.vue'
import type { DashboardTileKey } from '~/types/cms/config'

definePageMeta({ layout: 'cms' })

const configStore = useCmsConfigStore()

const draft = ref('')
const showConfirm = ref(false)

const tileInput = ref<HTMLInputElement>()
const activeTile = ref<DashboardTileKey | null>(null)

const dashboardTiles: { key: DashboardTileKey; label: string }[] = [
  { key: 'manual', label: 'Manual' },
  { key: 'template', label: 'Plantillas' },
  { key: 'duel', label: 'Duelo' },
  { key: 'challenge', label: 'Retos' },
]

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

function pickTileImage(tile: DashboardTileKey) {
  activeTile.value = tile
  tileInput.value?.click()
}

async function handleTileFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  target.value = ''
  if (!file || !activeTile.value) return
  await configStore.uploadTileImage(activeTile.value, file)
  activeTile.value = null
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

    <div class="mt-10">
      <h2 class="mb-1.5 text-sm font-semibold text-forge-text">
        Imágenes del dashboard
      </h2>
      <p class="mb-4 text-xs text-forge-muted">
        Portada de cada card de "Empieza a entrenar" en la app. Sin imagen, la
        card se muestra con un fondo neutro.
      </p>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          v-for="tile in dashboardTiles"
          :key="tile.key"
          class="flex flex-col items-center gap-2"
        >
          <div class="relative h-24 w-full overflow-hidden rounded-lg bg-forge-surfaceAlt">
            <img
              v-if="configStore.tileImages[tile.key]"
              :src="configStore.tileImages[tile.key]!"
              alt=""
              class="h-full w-full object-cover"
            >
            <div v-else class="flex h-full w-full items-center justify-center text-forge-muted">
              <Camera :size="18" />
            </div>
            <div
              v-if="configStore.uploadingTile === tile.key"
              class="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <Loader2 :size="18" class="animate-spin text-white" />
            </div>
          </div>
          <p class="text-xs font-medium text-forge-textSec">{{ tile.label }}</p>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded p-1.5 text-forge-textSec hover:bg-forge-surfaceAlt hover:text-forge-text"
              aria-label="Subir imagen"
              :disabled="configStore.uploadingTile !== null"
              @click="pickTileImage(tile.key)"
            >
              <Camera :size="14" />
            </button>
            <button
              v-if="configStore.tileImages[tile.key]"
              type="button"
              class="rounded p-1.5 text-forge-textSec hover:bg-forge-danger/10 hover:text-forge-danger"
              aria-label="Eliminar imagen"
              :disabled="configStore.uploadingTile !== null"
              @click="configStore.removeTileImage(tile.key)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>

      <p v-if="configStore.tileError" class="mt-3 text-sm text-forge-danger">
        {{ configStore.tileError }}
      </p>

      <input
        ref="tileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleTileFileChange"
      >
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
