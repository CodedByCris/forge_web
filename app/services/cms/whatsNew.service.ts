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
  getDoc,
  getDocs,
  setDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { CmsWhatsNewItem } from '~/types/cms/whatsNew'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getWhatsNewItems(): Promise<CmsWhatsNewItem[]> {
  const db = getFirestore()
  const q = query(collection(db, 'whats_new_items'), orderBy('order'))
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

export async function createWhatsNewItem(title: string, description: string): Promise<string> {
  const db = getFirestore()
  const docRef = await addDoc(collection(db, 'whats_new_items'), {
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

export async function updateWhatsNewItem(id: string, title: string, description: string): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), {
    title,
    description,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWhatsNewItem(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'whats_new_items', id))
}

export async function toggleWhatsNewActive(id: string, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { isActive, updatedAt: serverTimestamp() })
}

export async function updateWhatsNewItemOrder(id: string, order: number): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { order })
}

export async function uploadWhatsNewImage(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `whats_new/${id}/photo.jpg`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { imageUrl: url, updatedAt: serverTimestamp() })
  return url
}

export async function deleteWhatsNewImage(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `whats_new/${id}/photo.jpg`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (!(e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found')) {
      throw e
    }
  }
  const db = getFirestore()
  await updateDoc(doc(db, 'whats_new_items', id), { imageUrl: null, updatedAt: serverTimestamp() })
}

export async function getWhatsNewVersion(): Promise<number> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'config', 'appConfig'))
  return snap.data()?.whatsNewVersion ?? 0
}

export async function bumpWhatsNewVersion(currentVersion: number): Promise<number> {
  const db = getFirestore()
  const next = currentVersion + 1
  await setDoc(doc(db, 'config', 'appConfig'), { whatsNewVersion: next }, { merge: true })
  return next
}
