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
  lastXpDate: string | null // 'YYYY-MM-DD'
  purchasedItems: string[]
  weeklyGoalDays: number | null // 1–7
}
