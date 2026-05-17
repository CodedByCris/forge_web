import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type DocumentSnapshot,
} from 'firebase/firestore'
import type {
  WorkoutSummary,
  WorkoutDetail,
  WorkoutFeedback,
  WorkoutSet,
  WorkoutExercise,
} from '~/types/workout'

interface FinishedSet {
  weight: number | null
  reps: number | null
  completed: boolean
  setType: string
  durationSeconds: number | null
  distanceKm: number | null
  inclinationPercent: number | null
}

interface FinishedExercise {
  name: string
  nameEs: string | null
  order: number
  exerciseType: string
  notes: string | null
  sets: FinishedSet[]
}

export const workoutService = {
  async createWorkout(params: {
    userId: string
    name: string
    color: number
  }): Promise<string> {
    const ref = await addDoc(collection(getFirestore(), 'workouts'), {
      userId: params.userId,
      name: params.name,
      color: params.color,
      startedAt: serverTimestamp(),
      endedAt: null,
      isCompleted: false,
      multiSessionId: null,
      xpEarned: null,
      feedback: null,
    })
    return ref.id
  },

  async finishWorkout(params: {
    workoutId: string
    exercises: FinishedExercise[]
    xpEarned: number
  }): Promise<void> {
    const batch = writeBatch(getFirestore())

    batch.update(doc(getFirestore(), 'workouts', params.workoutId), {
      isCompleted: true,
      endedAt: serverTimestamp(),
      xpEarned: params.xpEarned,
    })

    params.exercises.forEach((ex) => {
      const exRef = doc(
        collection(getFirestore(), 'workouts', params.workoutId, 'exercises'),
      )
      batch.set(exRef, {
        name: ex.name,
        nameEs: ex.nameEs ?? null,
        order: ex.order,
        exerciseType: ex.exerciseType,
        notes: ex.notes ?? null,
        sets: ex.sets.map((s, i) => ({
          setNumber: i + 1,
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
          setType: s.setType,
          durationSeconds: s.durationSeconds ?? null,
          distanceKm: s.distanceKm ?? null,
          inclinationPercent: s.inclinationPercent ?? null,
        })),
      })
    })

    await batch.commit()
  },

  async saveFeedback(workoutId: string, feedback: WorkoutFeedback): Promise<void> {
    await updateDoc(doc(getFirestore(), 'workouts', workoutId), {
      feedback: {
        difficulty: feedback.difficulty,
        energyLevel: feedback.energyLevel,
        notes: feedback.notes ?? null,
        savedAt: serverTimestamp(),
      },
    })
  },

  async fetchWorkoutsPage(params: {
    userId: string
    pageSize?: number
    lastDoc?: DocumentSnapshot
  }): Promise<{ workouts: WorkoutSummary[]; lastDoc: DocumentSnapshot | null }> {
    let q = query(
      collection(getFirestore(), 'workouts'),
      where('userId', '==', params.userId),
      where('isCompleted', '==', true),
      orderBy('startedAt', 'desc'),
      limit(params.pageSize ?? 10),
    )
    if (params.lastDoc) q = query(q, startAfter(params.lastDoc))

    const snap = await getDocs(q)
    return {
      workouts: snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name,
          color: data.color,
          startedAt: data.startedAt?.toDate() ?? new Date(),
          isCompleted: data.isCompleted,
          xpEarned: data.xpEarned ?? null,
        } satisfies WorkoutSummary
      }),
      lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    }
  },

  async fetchWorkoutDetail(workoutId: string): Promise<WorkoutDetail> {
    const [workoutSnap, exercisesSnap] = await Promise.all([
      getDoc(doc(getFirestore(), 'workouts', workoutId)),
      getDocs(
        query(
          collection(getFirestore(), 'workouts', workoutId, 'exercises'),
          orderBy('order', 'asc'),
        ),
      ),
    ])

    if (!workoutSnap.exists()) throw new Error('Workout not found')

    const d = workoutSnap.data()
    const exercises: WorkoutExercise[] = exercisesSnap.docs.map((ex) => {
      const e = ex.data()
      return {
        id: ex.id,
        name: e.name,
        nameEs: e.nameEs ?? null,
        order: e.order,
        exerciseType: e.exerciseType,
        notes: e.notes ?? null,
        sets: (e.sets ?? []).map((s: WorkoutSet) => ({
          setNumber: s.setNumber,
          weight: s.weight ?? null,
          reps: s.reps ?? null,
          completed: s.completed,
          setType: s.setType,
          durationSeconds: s.durationSeconds ?? null,
          distanceKm: s.distanceKm ?? null,
          inclinationPercent: s.inclinationPercent ?? null,
        })),
      }
    })

    return {
      id: workoutSnap.id,
      userId: d.userId,
      name: d.name,
      color: d.color,
      startedAt: d.startedAt?.toDate() ?? new Date(),
      endedAt: d.endedAt?.toDate() ?? null,
      isCompleted: d.isCompleted,
      exercises,
      xpEarned: d.xpEarned ?? null,
    }
  },

  async fetchGhostSets(params: {
    userId: string
    exerciseNames: string[]
  }): Promise<Record<string, WorkoutSet[]>> {
    const result: Record<string, WorkoutSet[]> = {}

    const workoutsSnap = await getDocs(
      query(
        collection(getFirestore(), 'workouts'),
        where('userId', '==', params.userId),
        where('isCompleted', '==', true),
        orderBy('startedAt', 'desc'),
        limit(20),
      ),
    )

    for (const workoutDoc of workoutsSnap.docs) {
      const exercisesSnap = await getDocs(
        collection(getFirestore(), 'workouts', workoutDoc.id, 'exercises'),
      )
      for (const exDoc of exercisesSnap.docs) {
        const name = exDoc.data().name as string
        if (params.exerciseNames.includes(name) && !result[name]) {
          result[name] = exDoc.data().sets as WorkoutSet[]
        }
      }
      if (Object.keys(result).length === params.exerciseNames.length) break
    }

    return result
  },
}
