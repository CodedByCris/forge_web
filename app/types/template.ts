import type { ExerciseType } from './workout'
import type { MuscleGroup } from './exercise'

export interface PlannedExercise {
  name: string
  nameEs: string | null
  order: number
  defaultSets: number
  defaultReps: string // '8-12', '10', 'AMRAP'
  exerciseId: string | null
  bodyParts: MuscleGroup[]
  exerciseType: ExerciseType
}

export interface WorkoutTemplate {
  id: string
  name: string
  color: number // ARGB int
  exercises: PlannedExercise[]
  updatedAt: Date
}
