export interface CmsUser {
  uid: string
  email: string
  nickname: string
  photoUrl: string | null
  buildType: string | null
  isAdmin: boolean
  isPrivate: boolean
  totalXp: number
  coins: number
  currentStreak: number
  followersCount: number
  followingCount: number
  activeTitle: string | null
  createdAt: Date | null
}

export interface CmsWorkoutSummary {
  id: string
  name: string
  startedAt: Date | null
  endedAt: Date | null
}
