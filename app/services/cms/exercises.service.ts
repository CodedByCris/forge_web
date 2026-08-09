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
  where,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import type { CmsExercise, CmsExerciseType } from '~/types/cms/exercise'

// Caracter de la Zona de Uso Privado de Unicode: mayor que cualquier
// caracter normal, usado como convencion de Firestore para simular
// prefix-match con un rango >= term && <= term + este caracter.
const PREFIX_RANGE_END = ''

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
  }
}

export interface ExercisesPage {
  exercises: CmsExercise[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export async function getExercisesPage(
  cursor: QueryDocumentSnapshot<DocumentData> | null,
  pageSize = 25,
): Promise<ExercisesPage> {
  const db = getFirestore()
  let q = query(collection(db, 'exercises'), orderBy('name'), limit(pageSize))
  if (cursor) {
    q = query(collection(db, 'exercises'), orderBy('name'), startAfter(cursor), limit(pageSize))
  }
  const snap = await getDocs(q)
  return {
    exercises: snap.docs.map((d) => toExercise(d.id, d.data())),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === pageSize,
  }
}

export async function searchExercisesByName(term: string, pageSize = 25): Promise<CmsExercise[]> {
  const db = getFirestore()
  const q = query(
    collection(db, 'exercises'),
    orderBy('name'),
    where('name', '>=', term),
    where('name', '<=', term + PREFIX_RANGE_END),
    limit(pageSize),
  )
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
