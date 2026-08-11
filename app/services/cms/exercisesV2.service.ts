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
import type { CmsExerciseV2 } from '~/types/cms/exerciseV2'
import type { CmsExerciseType } from '~/types/cms/exercise'

function toExerciseV2(id: string, data: DocumentData): CmsExerciseV2 {
  return {
    id,
    name: data.name ?? '',
    bodyParts: data.bodyParts ?? [],
    category: data.category ?? null,
    exerciseType: (data.exerciseType ?? 'std') as CmsExerciseType,
    equipmentOptions: data.equipmentOptions ?? [],
    instructionSteps: data.instructionSteps ?? [],
    imageUrl: data.imageUrl ?? null,
    lottieUrl: data.lottieUrl ?? null,
    isActive: data.isActive === true,
    legacyIds: data.legacyIds ?? [],
    legacyPrimaryId: data.legacyPrimaryId ?? null,
  }
}

// Colección pequeña (504 docs) — se carga entera de una vez, igual que
// exercises.service.ts (ver ese archivo para el mismo patrón).
export async function getAllExercisesV2(): Promise<CmsExerciseV2[]> {
  const db = getFirestore()
  const q = query(collection(db, 'exercises_v2'), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => toExerciseV2(d.id, d.data()))
}

export async function getExerciseV2(id: string): Promise<CmsExerciseV2 | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'exercises_v2', id))
  if (!snap.exists()) return null
  return toExerciseV2(snap.id, snap.data())
}

export async function updateExerciseV2(id: string, data: Partial<Omit<CmsExerciseV2, 'id'>>): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'exercises_v2', id), data)
}

export async function uploadExerciseV2Image(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises_v2/${id}/photo.jpg`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  return getDownloadURL(fileRef)
}

export async function deleteExerciseV2Image(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises_v2/${id}/photo.jpg`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found') return
    throw e
  }
}

export async function uploadExerciseV2Lottie(id: string, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises_v2/${id}/animation.json`)
  await uploadBytes(fileRef, file, { contentType: 'application/json' })
  return getDownloadURL(fileRef)
}

export async function deleteExerciseV2Lottie(id: string): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `exercises_v2/${id}/animation.json`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found') return
    throw e
  }
}
