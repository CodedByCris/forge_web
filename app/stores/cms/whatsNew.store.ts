import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'
import {
  getWhatsNewItems,
  createWhatsNewItem,
  updateWhatsNewItem,
  deleteWhatsNewItem,
  toggleWhatsNewActive,
  updateWhatsNewItemOrder,
  uploadWhatsNewImage,
  deleteWhatsNewImage,
  getWhatsNewVersion,
  bumpWhatsNewVersion,
} from '~/services/cms/whatsNew.service'

export const useCmsWhatsNewStore = defineStore('cmsWhatsNew', () => {
  const items = ref<CmsWhatsNewItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  const version = ref(0)
  const versionLoading = ref(false)
  const forcing = ref(false)
  const forceError = ref<string | null>(null)

  async function fetchItems(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await getWhatsNewItems()
    } catch {
      error.value = 'No se pudieron cargar las Novedades.'
    } finally {
      loading.value = false
    }
  }

  async function fetchVersion(): Promise<void> {
    versionLoading.value = true
    try {
      version.value = await getWhatsNewVersion()
    } catch {
      // La página ya muestra el error principal del listado si algo falla.
    } finally {
      versionLoading.value = false
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
        await updateWhatsNewItem(itemId, title, description)
      } else {
        itemId = await createWhatsNewItem(title, description)
      }
      if (imageFile) {
        await uploadWhatsNewImage(itemId, imageFile)
      } else if (removeImage) {
        await deleteWhatsNewImage(itemId)
      }
      await fetchItems()
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar la pantalla.'
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeItem(id: string): Promise<boolean> {
    try {
      await deleteWhatsNewItem(id)
      items.value = items.value.filter((i) => i.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function toggleActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await toggleWhatsNewActive(id, isActive)
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
        updateWhatsNewItemOrder(current.id, targetOrder),
        updateWhatsNewItemOrder(target.id, currentOrder),
      ])
      current.order = targetOrder
      target.order = currentOrder
      items.value = [...items.value].sort((a, b) => a.order - b.order)
    } catch {
      error.value = 'No se pudo reordenar.'
    }
  }

  async function forceReappear(): Promise<boolean> {
    forcing.value = true
    forceError.value = null
    try {
      version.value = await bumpWhatsNewVersion(version.value)
      return true
    } catch (e) {
      forceError.value = e instanceof FirebaseError
        ? `No se pudo forzar la reaparición (${e.code}).`
        : 'No se pudo forzar la reaparición.'
      return false
    } finally {
      forcing.value = false
    }
  }

  return {
    items,
    loading,
    error,
    saving,
    saveError,
    version,
    versionLoading,
    forcing,
    forceError,
    fetchItems,
    fetchVersion,
    saveItem,
    removeItem,
    toggleActive,
    moveItem,
    forceReappear,
  }
})
