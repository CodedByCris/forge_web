import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import type { CmsAppConfig, DashboardTileKey } from '~/types/cms/config'

const TILE_FIELD: Record<DashboardTileKey, keyof CmsAppConfig> = {
  manual: 'manualWorkImageUrl',
  template: 'templateWorkImageUrl',
  duel: 'duelWorkImageUrl',
  challenge: 'challengeWorkImageUrl',
}

export async function getAppConfig(): Promise<CmsAppConfig> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'config', 'appConfig'))
  const data = snap.data()
  return {
    exercisesCacheKey: data?.exercisesCacheKey ?? '',
    manualWorkImageUrl: data?.manualWorkImageUrl ?? null,
    templateWorkImageUrl: data?.templateWorkImageUrl ?? null,
    duelWorkImageUrl: data?.duelWorkImageUrl ?? null,
    challengeWorkImageUrl: data?.challengeWorkImageUrl ?? null,
  }
}

export async function updateExercisesCacheKey(value: string): Promise<void> {
  const db = getFirestore()
  await setDoc(doc(db, 'config', 'appConfig'), { exercisesCacheKey: value }, { merge: true })
}

export async function uploadDashboardTileImage(tile: DashboardTileKey, file: File): Promise<string> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `app_config/${tile}_work.jpg`)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  const db = getFirestore()
  await setDoc(doc(db, 'config', 'appConfig'), { [TILE_FIELD[tile]]: url }, { merge: true })
  return url
}

export async function deleteDashboardTileImage(tile: DashboardTileKey): Promise<void> {
  const storage = getStorage()
  const fileRef = storageRef(storage, `app_config/${tile}_work.jpg`)
  try {
    await deleteObject(fileRef)
  } catch (e) {
    if (!(e instanceof Error && 'code' in e && (e as { code: string }).code === 'storage/object-not-found')) {
      throw e
    }
  }
  const db = getFirestore()
  await setDoc(doc(db, 'config', 'appConfig'), { [TILE_FIELD[tile]]: null }, { merge: true })
}
