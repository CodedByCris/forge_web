import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import type { CmsShopCollection } from '~/types/cms/shopCollection'

export interface ShopCollectionFormInput {
  title: string
  titleEn: string
  badge: string
  badgeEn: string
  itemIds: string[]
}

function toCollection(id: string, data: Record<string, unknown>): CmsShopCollection {
  return {
    id,
    title: (data.title as string) ?? '',
    titleEn: (data.titleEn as string) ?? '',
    badge: (data.badge as string) ?? '',
    badgeEn: (data.badgeEn as string) ?? '',
    itemIds: Array.isArray(data.itemIds) ? (data.itemIds as string[]) : [],
    order: (data.order as number) ?? 0,
    isActive: data.isActive === true,
  }
}

export async function getShopCollections(): Promise<CmsShopCollection[]> {
  const db = getFirestore()
  const q = query(collection(db, 'shop_collections'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toCollection(d.id, d.data()))
}

export async function createShopCollection(input: ShopCollectionFormInput): Promise<string> {
  const db = getFirestore()
  const docRef = await addDoc(collection(db, 'shop_collections'), {
    title: input.title,
    titleEn: input.titleEn,
    badge: input.badge,
    badgeEn: input.badgeEn,
    itemIds: input.itemIds,
    isActive: true,
    order: Date.now(),
  })
  return docRef.id
}

export async function updateShopCollection(id: string, input: ShopCollectionFormInput): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'shop_collections', id), {
    title: input.title,
    titleEn: input.titleEn,
    badge: input.badge,
    badgeEn: input.badgeEn,
    itemIds: input.itemIds,
  })
}

export async function deleteShopCollection(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'shop_collections', id))
}

export async function toggleShopCollectionActive(id: string, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'shop_collections', id), { isActive })
}

export async function updateShopCollectionOrder(id: string, order: number): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'shop_collections', id), { order })
}
