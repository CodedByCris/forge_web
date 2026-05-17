import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  getAuth,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import type { UserProfile, UserBuildType } from '~/types/user'

export interface ProfileUpdateParams {
  nickname?: string
  firstName?: string | null
  lastName?: string | null
  heightCm?: number | null
  weightKg?: number | null
  buildType?: UserBuildType | null
  isPrivate?: boolean
  weeklyGoalDays?: number | null
}

export const profileService = {
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(getFirestore(), 'users', userId))
    if (!snap.exists()) return null

    const d = snap.data()
    return {
      id: snap.id,
      email: d.email ?? '',
      nickname: d.nickname ?? '',
      photoUrl: d.photoUrl ?? null,
      firstName: d.firstName ?? null,
      lastName: d.lastName ?? null,
      heightCm: d.heightCm ?? null,
      weightKg: d.weightKg ?? null,
      configured: d.configured ?? false,
      buildType: d.buildType ?? null,
      activeTitle: d.activeTitle ?? null,
      isPrivate: d.isPrivate ?? false,
      followersCount: d.followersCount ?? 0,
      followingCount: d.followingCount ?? 0,
      totalXp: d.totalXp ?? 0,
      coins: d.coins ?? 0,
      lastXpDate: d.lastXpDate ?? null,
      purchasedItems: d.purchasedItems ?? [],
      weeklyGoalDays: d.weeklyGoalDays ?? null,
    }
  },

  async updateProfile(userId: string, params: ProfileUpdateParams): Promise<void> {
    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) updates[key] = value
    }
    await updateDoc(doc(getFirestore(), 'users', userId), updates)
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(getAuth(), email)
  },

  async deleteAccount(password: string): Promise<void> {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user || !user.email) throw new Error('no_user')
    const cred = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, cred)
    await deleteUser(user)
  },
}
