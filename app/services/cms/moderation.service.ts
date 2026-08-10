import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import type { CmsModeratedPost, CmsModeratedRoutine } from '~/types/cms/moderation'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getRecentPosts(): Promise<CmsModeratedPost[]> {
  const db = getFirestore()
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      userNickname: data.userNickname ?? '',
      userPhotoUrl: data.userPhotoUrl ?? null,
      workoutName: data.workoutName ?? '',
      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

export async function getRecentRoutines(): Promise<CmsModeratedRoutine[]> {
  const db = getFirestore()
  const q = query(
    collection(db, 'routines'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      userNickname: data.userNickname ?? '',
      userPhotoUrl: data.userPhotoUrl ?? null,
      name: data.name ?? '',
      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

export async function deletePost(id: string): Promise<void> {
  const functions = getFunctions()
  const callable = httpsCallable(functions, 'adminDeleteContent')
  await callable({ collection: 'posts', id })
}

export async function deleteRoutine(id: string): Promise<void> {
  const functions = getFunctions()
  const callable = httpsCallable(functions, 'adminDeleteContent')
  await callable({ collection: 'routines', id })
}
