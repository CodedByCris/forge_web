import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'
import type { CmsShopItem } from '~/types/cms/shopItem'
import {
  getShopItems,
  createShopItem,
  updateShopItem,
  deleteShopItem,
  toggleShopItemActive,
  uploadShopItemSound,
  deleteShopItemSound,
  type ShopItemFormInput,
} from '~/services/cms/shopItems.service'

export const useCmsShopItemsStore = defineStore('cmsShopItems', () => {
  const items = ref<CmsShopItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saving = ref(false)
  const saveError = ref<string | null>(null)

  async function fetchItems(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const fetched = await getShopItems()
      items.value = [...fetched].sort((a, b) => {
        if (a.rewardType !== b.rewardType) return a.rewardType.localeCompare(b.rewardType)
        return a.displayName.localeCompare(b.displayName)
      })
    } catch {
      error.value = 'No se pudieron cargar los productos de la tienda.'
    } finally {
      loading.value = false
    }
  }

  async function saveItem(
    input: ShopItemFormInput,
    soundFile: File | null,
    removeSound: boolean,
    id?: string,
  ): Promise<boolean> {
    saving.value = true
    saveError.value = null
    try {
      let itemId = id
      if (itemId) {
        const existing = items.value.find((i) => i.id === itemId)
        await updateShopItem(itemId, input, existing?.isActive ?? true)
      } else {
        itemId = await createShopItem(input)
      }
      if (input.rewardType === 'soundEffect') {
        if (soundFile) {
          await uploadShopItemSound(itemId, soundFile)
        } else if (removeSound) {
          await deleteShopItemSound(itemId)
        }
      }
      await fetchItems()
      return true
    } catch (e) {
      saveError.value = e instanceof FirebaseError
        ? `No se pudo guardar (${e.code}).`
        : 'No se pudo guardar el producto.'
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeItem(id: string): Promise<boolean> {
    try {
      await deleteShopItem(id)
      items.value = items.value.filter((i) => i.id !== id)
      return true
    } catch {
      return false
    }
  }

  async function toggleActive(id: string, isActive: boolean): Promise<boolean> {
    try {
      await toggleShopItemActive(id, isActive)
      const item = items.value.find((i) => i.id === id)
      if (item) item.isActive = isActive
      return true
    } catch {
      return false
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
  }
})
