import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import type { WorkoutTemplate, PlannedExercise } from '~/types/template'

const templatesRef = (userId: string) =>
  collection(getFirestore(), 'users', userId, 'workout_templates')

export const templateService = {
  watchTemplates(
    userId: string,
    cb: (templates: WorkoutTemplate[]) => void,
  ): () => void {
    const q = query(templatesRef(userId), orderBy('updatedAt', 'desc'))
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map(mapTemplate))
    })
  },

  async createTemplate(
    userId: string,
    params: { name: string; color: number; exercises: PlannedExercise[] },
  ): Promise<string> {
    const ref = await addDoc(templatesRef(userId), {
      name: params.name,
      color: params.color,
      exercises: params.exercises.map((e, i) => ({
        name: e.name,
        nameEs: e.nameEs ?? null,
        order: i,
        defaultSets: e.defaultSets,
        defaultReps: e.defaultReps,
        exerciseId: e.exerciseId ?? null,
        bodyParts: e.bodyParts,
        exerciseType: e.exerciseType,
      })),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  },

  async updateTemplate(
    userId: string,
    templateId: string,
    params: { name: string; color: number; exercises: PlannedExercise[] },
  ): Promise<void> {
    await setDoc(
      doc(templatesRef(userId), templateId),
      {
        name: params.name,
        color: params.color,
        exercises: params.exercises.map((e, i) => ({ ...e, order: i })),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  },

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    await deleteDoc(doc(templatesRef(userId), templateId))
  },
}

function mapTemplate(d: { id: string; data: () => Record<string, unknown> }): WorkoutTemplate {
  const data = d.data()
  return {
    id: d.id,
    name: data.name as string,
    color: data.color as number,
    exercises: ((data.exercises ?? []) as Record<string, unknown>[]).map((e) => ({
      name: e.name as string,
      nameEs: (e.nameEs as string | null) ?? null,
      order: e.order as number,
      defaultSets: e.defaultSets as number,
      defaultReps: e.defaultReps as string,
      exerciseId: (e.exerciseId as string | null) ?? null,
      bodyParts: (e.bodyParts as string[]) ?? [],
      exerciseType: (e.exerciseType as string) ?? 'standard',
    })),
    updatedAt: (data.updatedAt as { toDate?: () => Date } | null)?.toDate?.() ?? new Date(),
  }
}
