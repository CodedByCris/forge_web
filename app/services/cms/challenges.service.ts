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
import type { CmsChallenge, CmsChallengeInput, CmsChallengeType } from '~/types/cms/challenge'

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getChallenges(): Promise<CmsChallenge[]> {
  const db = getFirestore()
  const snap = await getDocs(query(collection(db, 'challenges'), orderBy('endsAt', 'desc')))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      title: data.title ?? '',
      description: data.description ?? '',
      type: (data.type ?? 'workouts') as CmsChallengeType,
      target: data.target ?? 0,
      rewardCoins: data.rewardCoins ?? 0,
      rewardXp: data.rewardXp ?? 0,
      startsAt: toDateOrNull(data.startsAt),
      endsAt: toDateOrNull(data.endsAt),
      isActive: data.isActive === true,
      imageUrl: data.imageUrl ?? null,
      createdAt: toDateOrNull(data.createdAt),
    }
  })
}

function toPayload(input: CmsChallengeInput) {
  return {
    ...input,
    startsAt: Timestamp.fromDate(input.startsAt),
    endsAt: Timestamp.fromDate(input.endsAt),
  }
}

export async function createChallenge(input: CmsChallengeInput): Promise<void> {
  const db = getFirestore()
  await addDoc(collection(db, 'challenges'), {
    ...toPayload(input),
    isActive: true,
    createdAt: serverTimestamp(),
  })
}

export async function updateChallenge(id: string, input: CmsChallengeInput): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'challenges', id), toPayload(input))
}

export async function deleteChallenge(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'challenges', id))
}

export async function toggleChallengeActive(id: string, isActive: boolean): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, 'challenges', id), { isActive })
}
