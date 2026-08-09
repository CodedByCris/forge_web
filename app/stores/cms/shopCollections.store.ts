import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { CmsShopCollection } from '~/types/cms/shopCollection'
import {
  getShopCollections,
  createShopCollection,
  updateShopCollection,
  deleteShopCollection,
  toggleShopCollectionActive,
  updateShopCollectionOrder,
  type ShopCollectionFormInput,
} from '~/services/cms/shopCollections.service'

export const useCmsShopCollectionsStore = defineStore('cmsShopCollections', () => {
  const collections = ref<CmsShopCollection[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchCollections(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      collections.value = await getShopCollections()
    } catch {
      error.value = 'No se pudieron cargar las colecciones.'
    } finally {
      loading.value = false
    }
  }

  async function saveCollection(input: ShopCollectionFormInput, id?: string): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      if (id) {
        await updateShopCollection(id, input)
      } else {
        await createShopCollection(input)
      }
      await fetchCollections()
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar la colección.'
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeCollection(id: string): Promise<boolean> {
    try {
      await deleteShopCollection(id)
      collections.value = collections.value.filter((c) => c.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function toggleActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await toggleShopCollectionActive(id, isActive)
      const c = collections.value.find((c) => c.id === id)
      if (c) c.isActive = isActive
      return true
    } catch {
      return false
    }
  }

  async function moveCollection(id: string, direction: 'up' | 'down'): Promise<void> {
    const index = collections.value.findIndex((c) => c.id === id)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= collections.value.length) return
    const current = collections.value[index]
    const target = collections.value[targetIndex]
    if (!current || !target) return
    const currentOrder = current.order
    const targetOrder = target.order
    try {
      await Promise.all([
        updateShopCollectionOrder(current.id, targetOrder),
        updateShopCollectionOrder(target.id, currentOrder),
      ])
      current.order = targetOrder
      target.order = currentOrder
      collections.value = [...collections.value].sort((a, b) => a.order - b.order)
    } catch {
      error.value = 'No se pudo reordenar.'
    }
  }

  return {
    collections,
    loading,
    error,
    saving,
    saveError,
    fetchCollections,
    saveCollection,
    removeCollection,
    toggleActive,
    moveCollection,
  }
})
