import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import type { CmsUser, CmsWorkoutSummary } from '~/types/cms/user'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getUsers(): Promise<CmsUser[]> {
  const db = getFirestore()
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      uid: d.id,
      email: data.email ?? '',
      nickname: data.nickname ?? '',
      photoUrl: data.photoUrl ?? null,
      buildType: data.buildType ?? null,
      isAdmin: data.isAdmin === true,
      isPrivate: data.isPrivate === true,
      totalXp: data.totalXp ?? 0,
      coins: data.coins ?? 0,
      currentStreak: data.currentStreak ?? 0,
      followersCount: data.followersCount ?? 0,
      followingCount: data.followingCount ?? 0,
      activeTitle: data.activeTitle ?? null,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

export async function getUserWorkouts(uid: string, limitCount = 10): Promise<CmsWorkoutSummary[]> {
  const db = getFirestore()
  const q = query(
    collection(db, 'workouts'),
    where('userId', '==', uid),
    where('isCompleted', '==', true),
    orderBy('startedAt', 'desc'),
    limit(limitCount),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? '',
      startedAt: toDateOrNull(data.startedAt),
      endedAt: toDateOrNull(data.endedAt),
    }
  })
}

export async function adjustUserXpCoins(uid: string, deltaXp: number, deltaCoins: number): Promise<void> {
  const db = getFirestore()
  const updates: Record<string, ReturnType<typeof increment>> = {}
  if (deltaXp !== 0) updates.totalXp = increment(deltaXp)
  if (deltaCoins !== 0) updates.coins = increment(deltaCoins)
  if (Object.keys(updates).length === 0) return
  await updateDoc(doc(db, 'users', uid), updates)
}

export async function resetUserStreak(uid: string): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'users', uid), { currentStreak: 0 })
}

export async function adminDeleteUser(uid: string): Promise<void> {
  const functions = getFunctions()
  const callable = httpsCallable(functions, 'adminDeleteUser')
  await callable({ uid })
}
