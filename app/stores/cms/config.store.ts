import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import {
  getAppConfig,
  updateExercisesCacheKey,
  uploadDashboardTileImage,
  deleteDashboardTileImage,
} from '~/services/cms/config.service'
import type { DashboardTileKey } from '~/types/cms/config'

export const useCmsConfigStore = defineStore('cmsConfig', () => {
  const exercisesCacheKey = ref('')
  const tileImages = ref<Record<DashboardTileKey, string | null>>({
    manual: null,
    template: null,
    duel: null,
    challenge: null,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  const uploadingTile = ref<DashboardTileKey | null>(null)
  const tileError = ref<string | null>(null)

  async function fetchConfig(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const config = await getAppConfig()
      exercisesCacheKey.value = config.exercisesCacheKey
      tileImages.value = {
        manual: config.manualWorkImageUrl,
        template: config.templateWorkImageUrl,
        duel: config.duelWorkImageUrl,
        challenge: config.challengeWorkImageUrl,
      }
    } catch {
      error.value = 'No se pudo cargar la configuración.'
    } finally {
      loading.value = false
    }
  }

  async function save(value: string): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      await updateExercisesCacheKey(value)
      exercisesCacheKey.value = value
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar la configuración.'
      return false
    } finally {
      saving.value = false
    }
  }

  async function uploadTileImage(tile: DashboardTileKey, file: File): Promise<void> {
    uploadingTile.value = tile
    tileError.value = null
    try {
      const url = await uploadDashboardTileImage(tile, file)
      tileImages.value = { ...tileImages.value, [tile]: url }
    } catch {
      tileError.value = 'No se pudo subir la imagen.'
    } finally {
      uploadingTile.value = null
    }
  }

  async function removeTileImage(tile: DashboardTileKey): Promise<void> {
    uploadingTile.value = tile
    tileError.value = null
    try {
      await deleteDashboardTileImage(tile)
      tileImages.value = { ...tileImages.value, [tile]: null }
    } catch {
      tileError.value = 'No se pudo eliminar la imagen.'
    } finally {
      uploadingTile.value = null
    }
  }

  return {
    exercisesCacheKey,
    tileImages,
    loading,
    error,
    saving,
    saveError,
    uploadingTile,
    tileError,
    fetchConfig,
    save,
    uploadTileImage,
    removeTileImage,
  }
})
