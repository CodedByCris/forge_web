export interface ExercisePreview {
  name: string
  nameEs: string | null
  sets: number
  reps: string
}

export interface FeedComment {
  id: string
  userId: string
  userNickname: string
  text: string
  createdAt: Date
}

export interface FeedPost {
  id: string
  userId: string
  userNickname: string
  userPhotoUrl: string | null
  workoutId: string
  workoutName: string
  durationSeconds: number
  totalVolumeKg: number
  prsCount: number
  exercisesPreview: ExercisePreview[]
  likesCount: number
  commentsCount: number
  reactionsMap: Record<string, number>
  createdAt: Date
}
