import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import type { CmsAppConfig } from '~/types/cms/config'

export async function getAppConfig(): Promise<CmsAppConfig> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'config', 'appConfig'))
  return {
    exercisesCacheKey: snap.data()?.exercisesCacheKey ?? '',
  }
}

export async function updateExercisesCacheKey(value: string): Promise<void> {
  const db = getFirestore()
  await setDoc(doc(db, 'config', 'appConfig'), { exercisesCacheKey: value }, { merge: true })
}
