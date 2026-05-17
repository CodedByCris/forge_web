import { getFirestore, doc, getDoc } from 'firebase/firestore'
import type { UserProfile } from '~/types/user'

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
    }
  },
}
