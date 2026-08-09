import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { CmsGettingStartedItem } from '~/types/cms/gettingStarted'
import {
  getGettingStartedItems,
  createGettingStartedItem,
  updateGettingStartedItem,
  deleteGettingStartedItem,
  toggleGettingStartedActive,
  updateGettingStartedItemOrder,
  uploadGettingStartedImage,
  deleteGettingStartedImage,
} from '~/services/cms/gettingStarted.service'

export const useCmsGettingStartedStore = defineStore('cmsGettingStarted', () => {
  const items = ref<CmsGettingStartedItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchItems(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await getGettingStartedItems()
    } catch {
      error.value = 'No se pudieron cargar los pasos de la guía.'
    } finally {
      loading.value = false
    }
  }

  async function saveItem(
    title: string,
    description: string,
    imageFile: File | null,
    removeImage: boolean,
    id?: string,
  ): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      let itemId = id
      if (itemId) {
        await updateGettingStartedItem(itemId, title, description)
      } else {
        itemId = await createGettingStartedItem(title, description)
      }
      if (imageFile) {
        await uploadGettingStartedImage(itemId, imageFile)
      } else if (removeImage) {
        await deleteGettingStartedImage(itemId)
      }
      await fetchItems()
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar el paso.'
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeItem(id: string): Promise<boolean> {
    try {
      await deleteGettingStartedItem(id)
      items.value = items.value.filter((i) => i.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function toggleActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await toggleGettingStartedActive(id, isActive)
      const item = items.value.find((i) => i.id === id)
      if (item) item.isActive = isActive
      return true
    } catch {
      return false
    }
  }

  async function moveItem(id: string, direction: 'up' | 'down'): Promise<void> {
    const index = items.value.findIndex((i) => i.id === id)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.value.length) return
    const current = items.value[index]
    const target = items.value[targetIndex]
    if (!current || !target) return
    const currentOrder = current.order
    const targetOrder = target.order
    try {
      await Promise.all([
        updateGettingStartedItemOrder(current.id, targetOrder),
        updateGettingStartedItemOrder(target.id, currentOrder),
      ])
      current.order = targetOrder
      target.order = currentOrder
      items.value = [...items.value].sort((a, b) => a.order - b.order)
    } catch {
      error.value = 'No se pudo reordenar.'
    }
  }

  return {
    items,
    loading,
    error,
    saving,
    saveError,
    fetchItems,
    saveItem,
    removeItem,
    toggleActive,
    moveItem,
  }
})
