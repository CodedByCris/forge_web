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

// Solo presentación — la clave guardada en Firestore sigue en inglés
// (mismo patrón que EXERCISE_TYPE_LABELS). Traducciones alineadas con
// muscleGroup* en app_es.arb donde existe equivalente.
export const BODY_PART_LABELS: Record<CmsBodyPart, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazos',
  abs: 'Abdominales',
  glutes: 'Glúteos',
  quads: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  adductors: 'Aductores',
  abductors: 'Abductores',
  calves: 'Gemelos',
  cardio: 'Cardio',
  neck: 'Cuello',
  other: 'Otro',
}

export const EQUIPMENT_OPTIONS = [
  'assisted', 'band', 'barbell', 'body weight', 'bosu ball', 'cable',
  'dumbbell', 'elliptical machine', 'ez barbell', 'hammer', 'kettlebell',
  'leverage machine', 'medicine ball', 'olympic barbell', 'resistance band',
  'roller', 'rope', 'skierg machine', 'sled machine', 'smith machine',
  'stability ball', 'stationary bike', 'stepmill machine', 'tire',
  'trap bar', 'upper body ergometer', 'weighted', 'wheel roller',
] as const

// Traducciones copiadas de equipment* en app_es.arb — mismo texto en CMS y app.
export const EQUIPMENT_LABELS: Record<typeof EQUIPMENT_OPTIONS[number], string> = {
  assisted: 'Asistido',
  band: 'Banda',
  barbell: 'Barra',
  'body weight': 'Peso corporal',
  'bosu ball': 'Bosu',
  cable: 'Polea',
  dumbbell: 'Mancuerna',
  'elliptical machine': 'Elíptica',
  'ez barbell': 'Barra EZ',
  hammer: 'Martillo',
  kettlebell: 'Kettlebell',
  'leverage machine': 'Máquina',
  'medicine ball': 'Balón medicinal',
  'olympic barbell': 'Barra olímpica',
  'resistance band': 'Banda de resistencia',
  roller: 'Rodillo',
  rope: 'Cuerda',
  'skierg machine': 'Máquina SkiErg',
  'sled machine': 'Trineo',
  'smith machine': 'Máquina Smith',
  'stability ball': 'Fitball',
  'stationary bike': 'Bicicleta estática',
  'stepmill machine': 'Escaladora',
  tire: 'Neumático',
  'trap bar': 'Barra trampa',
  'upper body ergometer': 'Ergómetro de brazos',
  weighted: 'Con peso',
  'wheel roller': 'Rueda abdominal',
}

export const CATEGORY_OPTIONS = [
  'back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck',
  'shoulders', 'upper arms', 'upper legs', 'waist',
] as const

export const CATEGORY_LABELS: Record<typeof CATEGORY_OPTIONS[number], string> = {
  back: 'Espalda',
  cardio: 'Cardio',
  chest: 'Pecho',
  'lower arms': 'Antebrazos',
  'lower legs': 'Pantorrillas',
  neck: 'Cuello',
  shoulders: 'Hombros',
  'upper arms': 'Brazos',
  'upper legs': 'Muslos',
  waist: 'Abdomen',
}
