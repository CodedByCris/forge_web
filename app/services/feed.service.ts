import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'

interface WorkoutPostParams {
  userId: string
  userNickname: string
  userPhotoUrl: string | null
  workoutId: string
  workoutName: string
  durationSeconds: number
  totalVolumeKg: number
  prsCount: number
  exercisesPreview: Array<{
    name: string
    nameEs: string | null
    sets: number
    reps: string
  }>
}

export const feedService = {
  async createWorkoutPost(params: WorkoutPostParams): Promise<void> {
    await addDoc(collection(getFirestore(), 'posts'), {
      ...params,
      likesCount: 0,
      commentsCount: 0,
      reactionsMap: {},
      createdAt: serverTimestamp(),
    })
  },
}
