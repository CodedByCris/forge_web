import type { CmsExerciseType } from './exercise'

export interface CmsExerciseV2 {
  id: string
  name: string
  bodyParts: string[]
  category: string | null
  exerciseType: CmsExerciseType
  equipmentOptions: string[]
  instructionSteps: string[]
  imageUrl: string | null
  lottieUrl: string | null
  isActive: boolean
  legacyIds: string[]
  legacyPrimaryId: string | null
}
