import type { ExerciseType } from './workout'

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'cardio'

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazos',
  abs: 'Abdomen',
  glutes: 'Glúteos',
  quads: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  calves: 'Gemelos',
  cardio: 'Cardio',
}

export interface ExerciseEntity {
  id: string
  name: string
  nameEs: string | null
  bodyParts: MuscleGroup[]
  exerciseType: ExerciseType
  imageUrl: string | null
}
