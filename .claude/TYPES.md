# TypeScript Types — Gym Web

Todos los tipos compartidos entre features. Defínelos en `/train/types/`.

---

## Auth

```typescript
// types/auth.ts
export interface AuthUser {
  id: string
  email: string
}
```

---

## User Profile

```typescript
// types/user.ts
export type UserBuildType = 'powerlifter' | 'bodybuilder' | 'hybrid' | 'athlete'

export interface UserProfile {
  id: string
  email: string
  nickname: string
  photoUrl: string | null
  firstName: string | null
  lastName: string | null
  heightCm: number | null
  weightKg: number | null
  configured: boolean
  buildType: UserBuildType | null
  activeTitle: string | null
  isPrivate: boolean
  followersCount: number
  followingCount: number
  totalXp: number
  coins: number
  lastXpDate: string | null     // 'YYYY-MM-DD'
  purchasedItems: string[]
}

export interface ProfileStats {
  totalWorkouts: number
  workoutsThisWeek: number
  currentStreakDays: number
}
```

---

## Workout

```typescript
// types/workout.ts

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
  color: number             // ARGB int
  startedAt: Date
  endedAt: Date | null
  isCompleted: boolean
  exercises: WorkoutExercise[]
  xpEarned: number | null
}

export interface WorkoutFeedback {
  difficulty: WorkoutDifficulty
  energyLevel: number       // 1–5
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

// In-progress workout (client-side state)
export interface DraftSet {
  weight: string            // string para inputs flexibles
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
  startedAtMs: number       // Date.now()
  exercises: DraftExercise[]
}
```

---

## Templates

```typescript
// types/template.ts

export interface PlannedExercise {
  name: string
  nameEs: string | null
  order: number
  defaultSets: number
  defaultReps: string       // '8-12', '10', 'AMRAP'
  exerciseId: string | null
  bodyParts: string[]
  exerciseType: ExerciseType
}

export interface WorkoutTemplate {
  id: string
  name: string
  color: number             // ARGB int
  exercises: PlannedExercise[]
  updatedAt: Date
}
```

---

## Feed

```typescript
// types/feed.ts

export const REACTION_EMOJIS = ['🔥', '💪', '😤', '🧠'] as const
export type ReactionEmoji = typeof REACTION_EMOJIS[number]

export interface ExercisePreview {
  name: string
  nameEs: string | null
  sets: number
  reps: string
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
  reactionsMap: Record<string, number>   // emoji → count
  createdAt: Date
  likedByMe: boolean
  myReaction: string | null
}

export interface FeedComment {
  id: string
  userId: string
  userNickname: string
  userPhotoUrl: string | null
  text: string
  createdAt: Date
}
```

---

## Gamification

```typescript
// types/gamification.ts

export type RankTier =
  | 'madera' | 'hierro' | 'bronce' | 'plata'
  | 'oro' | 'platino' | 'diamante' | 'esmeralda'

export interface RankDefinition {
  tier: RankTier
  minLevel: number
  maxLevel: number | null
  primaryColor: string      // hex
  secondaryColor: string
  glowColor: string
}

export interface XpLevel {
  totalXp: number
  level: number             // Math.floor(totalXp / 100)
  xpInCurrentLevel: number  // totalXp % 100
  xpToNextLevel: number     // 100 - xpInCurrentLevel
  progress: number          // 0..1
  rank: RankDefinition
}

export interface UserPrEntry {
  weight: number
  date: Date
  workoutId: string | null
}

export interface UserPr {
  exerciseKey: string
  exerciseName: string
  exerciseNameEs: string | null
  bestByReps: Record<number, UserPrEntry>   // reps → entry
  estimatedOneRepMax: number
}

export interface AppBadge {
  id: string
  earnedAt: Date
  seen: boolean
}
```

---

## Exercises

```typescript
// types/exercise.ts

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'abs' | 'glutes' | 'quads' | 'hamstrings'
  | 'calves' | 'cardio'

export interface ExerciseEntity {
  id: string
  name: string
  nameEs: string | null
  bodyParts: MuscleGroup[]
  imageUrl: string | null
  exerciseType: ExerciseType
}
```

---

## Settings

```typescript
// types/settings.ts

export type GoalType = 'strength' | 'hypertrophy' | 'consistency' | 'custom'

export interface UserGoal {
  id: string
  type: GoalType
  title: string
  description: string | null
  targetValue: number
  startValue: number
  exerciseId: string | null
  exerciseName: string | null
  deadline: Date | null
  createdAt: Date
  completedAt: Date | null
  customCurrentValue: number | null
}
```

---

## Helpers

```typescript
// utils/xp.ts

/** Nivel desde XP total */
export function levelFromXp(totalXp: number): number {
  return Math.floor(totalXp / 100)
}

/** Progreso 0..1 dentro del nivel actual */
export function xpProgress(totalXp: number): number {
  return (totalXp % 100) / 100
}

/** Rango desde nivel */
export function rankFromLevel(level: number): RankDefinition {
  if (level >= 50) return RANKS.esmeralda
  if (level >= 35) return RANKS.diamante
  if (level >= 25) return RANKS.platino
  if (level >= 20) return RANKS.oro
  if (level >= 15) return RANKS.plata
  if (level >= 10) return RANKS.bronce
  if (level >= 5)  return RANKS.hierro
  return RANKS.madera
}

/** 1RM estimado */
export function estimatedOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30)
}

/** Duración legible: 1h 23m */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Color ARGB int → CSS hex */
export function argbToHex(argb: number): string {
  return `#${(argb & 0xFFFFFF).toString(16).padStart(6, '0')}`
}
```
