import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { CmsExercise } from '~/types/cms/exercise'
import {
  getAllExercises,
  getExercise,
  updateExercise,
  uploadExerciseImage,
  deleteExerciseImage,
  uploadExerciseLottie,
  deleteExerciseLottie,
} from '~/services/cms/exercises.service'

const CACHE_KEY = 'cms_exercises_cache_v1'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface ExercisesCache {
  savedAt: number
  exercises: CmsExercise[]
}

function readCache(): ExercisesCache | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExercisesCache
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(exercises: CmsExercise[], savedAt = Date.now()): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt, exercises }))
  } catch {
    // sessionStorage puede fallar en modo privado/cuota llena — no es crítico, se
    // pierde el caché pero el listado sigue funcionando con una query por visita.
  }
}

export const useCmsExercisesStore = defineStore('cmsExercises', () => {
  const exercises = ref<CmsExercise[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchTerm = ref('')

  const selected = ref<CmsExercise | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchAll(force = false): Promise<void> {
    if (!force) {
      const cached = readCache()
      if (cached) {
        exercises.value = cached.exercises
        return
      }
    }
    loading.value = true
    error.value = null
    try {
      const all = await getAllExercises()
      exercises.value = all
      writeCache(all)
    } catch {
      error.value = 'No se pudieron cargar los ejercicios.'
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id: string): Promise<void> {
    detailLoading.value = true
    detailError.value = null
    try {
      selected.value = await getExercise(id)
      if (!selected.value) detailError.value = 'Ejercicio no encontrado.'
    } catch {
      detailError.value = 'No se pudo cargar el ejercicio.'
    } finally {
      detailLoading.value = false
    }
  }

  async function saveDetail(
    id: string,
    data: Partial<Omit<CmsExercise, 'id'>>,
    imageFile: File | null,
    removeImage = false,
    lottieFile: File | null = null,
    removeLottie = false,
  ): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      let imageUrl = data.imageUrl
      if (imageFile) {
        imageUrl = await uploadExerciseImage(id, imageFile)
      } else if (removeImage) {
        await deleteExerciseImage(id)
        imageUrl = null
      }
      const imageChanged = Boolean(imageFile) || removeImage

      let lottieUrl = data.lottieUrl
      if (lottieFile) {
        lottieUrl = await uploadExerciseLottie(id, lottieFile)
      } else if (removeLottie) {
        await deleteExerciseLottie(id)
        lottieUrl = null
      }
      const lottieChanged = Boolean(lottieFile) || removeLottie

      const changes = {
        ...data,
        ...(imageChanged ? { imageUrl } : {}),
        ...(lottieChanged ? { lottieUrl } : {}),
      }
      await updateExercise(id, changes)
      if (selected.value) {
        selected.value = { ...selected.value, ...changes }
      }
      // Mantiene la lista (y su caché) coherente con la edición, sin
      // necesidad de volver a leer los ~1396 docs de Firestore.
      const idx = exercises.value.findIndex((e) => e.id === id)
      if (idx !== -1) {
        exercises.value = [
          ...exercises.value.slice(0, idx),
          { ...exercises.value[idx], ...changes } as CmsExercise,
          ...exercises.value.slice(idx + 1),
        ]
        writeCache(exercises.value)
      }
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar el ejercicio.'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    exercises,
    loading,
    error,
    searchTerm,
    selected,
    detailLoading,
    detailError,
    saving,
    saveError,
    fetchAll,
    fetchDetail,
    saveDetail,
  }
})
