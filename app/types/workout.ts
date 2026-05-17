export type SetType = 'warmup' | 'regular' | 'failed' | 'dropset'
export type ExerciseType = 'standard' | 'assistedBody' | 'timed' | 'cardioDistance'
export type WorkoutDifficulty = 'easy' | 'medium' | 'hard'

export interface WorkoutSet {
  setNumber: number
  weight: number | null
  reps: number | null
  completed: boolean
  setType: SetType
  durationSeconds: number | null
  distanceKm: number | null
  inclinationPercent: number | null
}

export interface WorkoutExercise {
  id: string
  name: string
  nameEs: string | null
  order: number
  exerciseType: ExerciseType
  sets: WorkoutSet[]
  notes: string | null
}

export interface WorkoutDetail {
  id: string
  userId: string
  name: string
  color: number
  startedAt: Date
  endedAt: Date | null
  isCompleted: boolean
  exercises: WorkoutExercise[]
  xpEarned: number | null
}

export interface WorkoutFeedback {
  difficulty: WorkoutDifficulty
  energyLevel: number // 1–5
  notes: string | null
}

export interface WorkoutSummary {
  id: string
  name: string
  color: number
  startedAt: Date
  isCompleted: boolean
  xpEarned: number | null
}

export interface DraftSet {
  weight: string
  reps: string
  completed: boolean
  setType: SetType
  durationSeconds: number | null
  distanceKm: string
  inclinationPercent: string
}

export interface DraftExercise {
  name: string
  nameEs: string | null
  order: number
  exerciseId: string | null
  bodyParts: string[]
  defaultSets: number
  defaultReps: string
  note: string
  sets: DraftSet[]
  exerciseType: ExerciseType
}

export interface WorkoutDraft {
  workoutId: string
  workoutName: string
  workoutColor: number
  startedAtMs: number
  exercises: DraftExercise[]
}
