import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { CmsFaq } from '~/types/cms/faq'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getFaqs(): Promise<CmsFaq[]> {
  const db = getFirestore()
  const q = query(collection(db, 'faq'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      question: data.question ?? '',
      answer: data.answer ?? '',
      isActive: data.isActive === true,
      order: data.order ?? 0,
      createdAt: toDateOrNull(data.createdAt),
      updatedAt: toDateOrNull(data.updatedAt),
    }
  })
}

export async function createFaq(question: string, answer: string): Promise<void> {
  const db = getFirestore()
  await addDoc(collection(db, 'faq'), {
    question,
    answer,
    isActive: true,
    order: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateFaq(id: string, question: string, answer: string): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'faq', id), {
    question,
    answer,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteFaq(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'faq', id))
}

export async function toggleFaqActive(id: string, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'faq', id), { isActive, updatedAt: serverTimestamp() })
}
