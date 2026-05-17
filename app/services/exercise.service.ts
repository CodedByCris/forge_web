import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import type { ExerciseEntity, MuscleGroup } from '~/types/exercise'

const CACHE_KEY = 'forge_exercises_v1'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 1 week

interface ExerciseCache {
  data: ExerciseEntity[]
  ts: number
}

export const exerciseService = {
  async fetchAll(): Promise<ExerciseEntity[]> {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, ts } = JSON.parse(cached) as ExerciseCache
      if (Date.now() - ts < CACHE_TTL) return data
    }

    const snap = await getDocs(
      query(collection(getFirestore(), 'exercises'), where('isActive', '==', true)),
    )

    const data: ExerciseEntity[] = snap.docs.map((d) => {
      const raw = d.data()
      return {
        id: d.id,
        name: raw.name as string,
        nameEs: (raw.nameEs as string | null) ?? null,
        bodyParts: ((raw.bodyParts as string[]) ?? []) as MuscleGroup[],
        exerciseType: (raw.exerciseType as string) ?? 'standard',
        imageUrl: (raw.imageUrl as string | null) ?? null,
      }
    })

    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
    return data
  },
}
