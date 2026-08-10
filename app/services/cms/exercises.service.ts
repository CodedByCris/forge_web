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
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  type DocumentData,
} from 'firebase/firestore'
import type { CmsExercise, CmsExerciseType } from '~/types/cms/exercise'

function toExercise(id: string, data: DocumentData): CmsExercise {
  return {
    id,
    name: data.name ?? '',
    bodyParts: data.bodyParts ?? [],
    exerciseType: (data.exerciseType ?? 'std') as CmsExerciseType,
    isActive: data.isActive === true,
    instructionSteps: data.instructionSteps ?? [],
    equipment: data.equipment ?? null,
    category: data.category ?? null,
    imageUrl: data.imageUrl ?? null,
    lottieUrl: data.lottieUrl ?? null,
  }
}

// Colección pequeña (~1400 docs) — se carga entera de una vez y se cachea
// en cliente (ver exercises.store.ts). Búsqueda y filtros se resuelven
// después en memoria, sin más queries a Firestore.
export async function getAllExercises(): Promise<CmsExercise[]> {
  const db = getFirestore()
  const q = query(collection(db, 'exercises'), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toExercise(d.id, d.data()))
}

export async function getExercise(id: string): Promise<CmsExercise | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'exercises', id))
  if (!snap.exists()) return null
  return toExercise(snap.id, snap.data())
}

export async function updateExercise(id: string, data: Partial<Omit<CmsExercise, 'id'>>): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'exercises', id), data)
}

export async function uploadExerciseImage(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises/${id}/photo.jpg`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  return getDownloadURL(fileRef)
}

export async function deleteExerciseImage(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises/${id}/photo.jpg`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found') return
    throw e
  }
}

export async function uploadExerciseLottie(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises/${id}/animation.json`)
  await uploadBytes(fileRef, file, { contentType: 'application/json' })
  return getDownloadURL(fileRef)
}

export async function deleteExerciseLottie(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises/${id}/animation.json`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found') return
    throw e
  }
}
