import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import { getAppConfig, updateExercisesCacheKey } from '~/services/cms/config.service'

export const useCmsConfigStore = defineStore('cmsConfig', () => {
  const exercisesCacheKey = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchConfig(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const config = await getAppConfig()
      exercisesCacheKey.value = config.exercisesCacheKey
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

  return {
    exercisesCacheKey,
    loading,
    error,
    saving,
    saveError,
    fetchConfig,
    save,
  }
})
