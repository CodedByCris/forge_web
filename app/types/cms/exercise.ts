export type CmsExerciseType = 'std' | 'ab' | 'tim' | 'tyd'

export const EXERCISE_TYPE_LABELS: Record<CmsExerciseType, string> = {
  std: 'Estándar',
  ab: 'Asistido',
  tim: 'Tiempo',
  tyd: 'Tiempo y distancia',
}

export const BODY_PARTS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'glutes', 'quads', 'hamstrings', 'adductors', 'abductors',
  'calves', 'cardio', 'neck', 'other',
] as const

export type CmsBodyPart = typeof BODY_PARTS[number]

export interface CmsExercise {
  id: string
  name: string
  bodyParts: string[]
  exerciseType: CmsExerciseType
  isActive: boolean
  instructionSteps: string[]
  equipment: string | null
  category: string | null
  imageUrl: string | null
}
