export type CmsChallengeType = 'workouts' | 'volumeKg' | 'durationMinutes' | 'duels'

export interface CmsChallenge {
  id: string
  title: string
  description: string
  type: CmsChallengeType
  target: number
  rewardCoins: number
  rewardXp: number
  startsAt: Date | null
  endsAt: Date | null
  isActive: boolean
  imageUrl: string | null
  createdAt: Date | null
}

export interface CmsChallengeInput {
  title: string
  description: string
  type: CmsChallengeType
  target: number
  rewardCoins: number
  rewardXp: number
  startsAt: Date
  endsAt: Date
  imageUrl: string | null
}

export const CHALLENGE_TYPE_LABELS: Record<CmsChallengeType, string> = {
  workouts: 'Entrenamientos',
  volumeKg: 'Volumen (kg)',
  durationMinutes: 'Duración (min)',
  duels: 'Duelos',
}
