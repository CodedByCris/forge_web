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

export const EQUIPMENT_OPTIONS = [
  'assisted', 'band', 'barbell', 'body weight', 'bosu ball', 'cable',
  'dumbbell', 'elliptical machine', 'ez barbell', 'hammer', 'kettlebell',
  'leverage machine', 'medicine ball', 'olympic barbell', 'resistance band',
  'roller', 'rope', 'skierg machine', 'sled machine', 'smith machine',
  'stability ball', 'stationary bike', 'stepmill machine', 'tire',
  'trap bar', 'upper body ergometer', 'weighted', 'wheel roller',
] as const

export const CATEGORY_OPTIONS = [
  'back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck',
  'shoulders', 'upper arms', 'upper legs', 'waist',
] as const

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
