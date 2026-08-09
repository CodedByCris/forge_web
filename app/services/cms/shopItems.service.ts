import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore'
import type { CmsShopItem, CmsShopItemRarity, CmsShopItemRewardType } from '~/types/cms/shopItem'

export interface ShopItemFormInput {
  displayName: string
  price: number
  rarity: CmsShopItemRarity
  minRankLevel: number
  rewardType: CmsShopItemRewardType
  themeId: string | null
  celebrationEffect: string | null
  boostMultiplier: number | null
  boostDurationHours: number | null
  boostWorkoutsLeft: number | null
  soundEffect: string | null
}

function toItem(id: string, data: Record<string, unknown>): CmsShopItem {
  return {
    id,
    displayName: (data.displayName as string) ?? '',
    price: (data.price as number) ?? 0,
    rewardType: (data.rewardType as CmsShopItemRewardType) ?? 'theme',
    rarity: (data.rarity as CmsShopItemRarity) ?? 'common',
    minRankLevel: (data.minRankLevel as number) ?? 0,
    isActive: data.isActive === true,
    themeId: (data.themeId as string) ?? null,
    celebrationEffect: (data.celebrationEffect as string) ?? null,
    boostMultiplier: (data.boostMultiplier as number) ?? null,
    boostDurationHours: (data.boostDurationHours as number) ?? null,
    boostWorkoutsLeft: (data.boostWorkoutsLeft as number) ?? null,
    soundEffect: (data.soundEffect as string) ?? null,
    soundUrl: (data.soundUrl as string) ?? null,
  }
}

function buildPayload(input: ShopItemFormInput, isActive: boolean) {
  return {
    displayName: input.displayName,
    price: input.price,
    rewardType: input.rewardType,
    rarity: input.rarity,
    minRankLevel: input.minRankLevel,
    isActive,
    themeId: input.rewardType === 'theme' ? input.themeId : null,
    celebrationEffect: input.rewardType === 'celebration' ? input.celebrationEffect : null,
    boostMultiplier: input.rewardType === 'xpBoost' ? input.boostMultiplier : null,
    boostDurationHours: input.rewardType === 'xpBoost' ? input.boostDurationHours : null,
    boostWorkoutsLeft: input.rewardType === 'xpBoost' ? input.boostWorkoutsLeft : null,
    soundEffect: input.rewardType === 'soundEffect' ? input.soundEffect : null,
  }
}

export async function getShopItems(): Promise<CmsShopItem[]> {
  const db = getFirestore()
  const snap = await getDocs(collection(db, 'shop_items'))
  return snap.docs.map((d) => toItem(d.id, d.data()))
}

export async function createShopItem(input: ShopItemFormInput): Promise<string> {
  const db = getFirestore()
  const payload = buildPayload(input, true)
  // La app resuelve nombre/descripción de las celebraciones a partir del ID
  // del documento (no de un campo) — forzamos que coincida con el id del
  // efecto elegido. Como mucho puede haber un doc por efecto (3 en total).
  if (input.rewardType === 'celebration' && input.celebrationEffect) {
    await setDoc(doc(db, 'shop_items', input.celebrationEffect), payload, { merge: true })
    return input.celebrationEffect
  }
  // Convención ya documentada en BACKEND.md para items de tema: id = 'theme_{themeId}'.
  // Un tema solo tiene una recompensa posible, así que no tiene sentido tener
  // dos documentos distintos para el mismo themeId.
  if (input.rewardType === 'theme' && input.themeId) {
    const id = `theme_${input.themeId}`
    await setDoc(doc(db, 'shop_items', id), payload, { merge: true })
    return id
  }
  const docRef = await addDoc(collection(db, 'shop_items'), payload)
  return docRef.id
}

export async function updateShopItem(id: string, input: ShopItemFormInput, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'shop_items', id), buildPayload(input, isActive))
}

export async function deleteShopItem(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'shop_items', id))
}

export async function toggleShopItemActive(id: string, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'shop_items', id), { isActive })
}

export async function uploadShopItemSound(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `shop_items/${id}/sound`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  const db = getFirestore()
  await updateDoc(doc(db, 'shop_items', id), { soundUrl: url })
  return url
}

export async function deleteShopItemSound(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `shop_items/${id}/sound`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (!(e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found')) {
      throw e
    }
  }
  const db = getFirestore()
  await updateDoc(doc(db, 'shop_items', id), { soundUrl: null })
}
