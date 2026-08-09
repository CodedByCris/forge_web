import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import type { CmsExercise } from '~/types/cms/exercise'
import {
  getExercisesPage,
  searchExercisesByName,
  getExercise,
  updateExercise,
  uploadExerciseImage,
  deleteExerciseImage,
} from '~/services/cms/exercises.service'

export const useCmsExercisesStore = defineStore('cmsExercises', () => {
  const exercises = ref<CmsExercise[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cursor = ref<QueryDocumentSnapshot<DocumentData> | null>(null)
  const hasMore = ref(true)
  const searchTerm = ref('')

  const selected = ref<CmsExercise | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchFirstPage(): Promise<void> {
    loading.value = true
    error.value = null
    cursor.value = null
    try {
      if (searchTerm.value.trim()) {
        exercises.value = await searchExercisesByName(searchTerm.value.trim())
        hasMore.value = false
      } else {
        const page = await getExercisesPage(null)
        exercises.value = page.exercises
        cursor.value = page.lastDoc
        hasMore.value = page.hasMore
      }
    } catch {
      error.value = 'No se pudieron cargar los ejercicios.'
    } finally {
      loading.value = false
    }
  }

  async function fetchNextPage(): Promise<void> {
    if (!hasMore.value || loading.value || searchTerm.value.trim()) return
    loading.value = true
    try {
      const page = await getExercisesPage(cursor.value)
      exercises.value = [...exercises.value, ...page.exercises]
      cursor.value = page.lastDoc
      hasMore.value = page.hasMore
    } catch {
      error.value = 'No se pudieron cargar más ejercicios.'
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
      await updateExercise(id, { ...data, ...(imageChanged ? { imageUrl } : {}) })
      if (selected.value) {
        selected.value = { ...selected.value, ...data, ...(imageChanged ? { imageUrl } : {}) }
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
    hasMore,
    searchTerm,
    selected,
    detailLoading,
    detailError,
    saving,
    saveError,
    fetchFirstPage,
    fetchNextPage,
    fetchDetail,
    saveDetail,
  }
})
