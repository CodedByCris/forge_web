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
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { CmsGettingStartedItem } from '~/types/cms/gettingStarted'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getGettingStartedItems(): Promise<CmsGettingStartedItem[]> {
  const db = getFirestore()
  const q = query(collection(db, 'getting_started_items'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      title: data.title ?? '',
      description: data.description ?? '',
      imageUrl: data.imageUrl ?? null,
      order: data.order ?? 0,
      isActive: data.isActive === true,
      createdAt: toDateOrNull(data.createdAt),
      updatedAt: toDateOrNull(data.updatedAt),
    }
  })
}

export async function createGettingStartedItem(title: string, description: string): Promise<string> {
  const db = getFirestore()
  const docRef = await addDoc(collection(db, 'getting_started_items'), {
    title,
    description,
    imageUrl: null,
    isActive: true,
    order: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateGettingStartedItem(id: string, title: string, description: string): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'getting_started_items', id), {
    title,
    description,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteGettingStartedItem(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'getting_started_items', id))
}

export async function toggleGettingStartedActive(id: string, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'getting_started_items', id), { isActive, updatedAt: serverTimestamp() })
}

export async function updateGettingStartedItemOrder(id: string, order: number): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'getting_started_items', id), { order })
}

export async function uploadGettingStartedImage(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `getting_started/${id}/photo.jpg`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  const db = getFirestore()
  await updateDoc(doc(db, 'getting_started_items', id), { imageUrl: url, updatedAt: serverTimestamp() })
  return url
}

export async function deleteGettingStartedImage(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `getting_started/${id}/photo.jpg`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (!(e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found')) {
      throw e
    }
  }
  const db = getFirestore()
  await updateDoc(doc(db, 'getting_started_items', id), { imageUrl: null, updatedAt: serverTimestamp() })
}
