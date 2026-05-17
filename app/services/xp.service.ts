import {
  getFirestore,
  doc,
  runTransaction,
} from 'firebase/firestore'

interface XpResult {
  alreadyAwarded: boolean
  newTotalXp: number
  newCoins: number
}

export const xpService = {
  /** Award XP + coins with idempotency guard (lastXpDate). */
  async awardWorkoutXp(
    userId: string,
    xpAmount: number,
    coinAmount: number,
  ): Promise<XpResult> {
    const today = new Date().toISOString().split('T')[0]
    const db = getFirestore()
    const userRef = doc(db, 'users', userId)

    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef)
      if (!snap.exists()) {
        return { alreadyAwarded: true, newTotalXp: 0, newCoins: 0 }
      }

      const data = snap.data()

      if (data.lastXpDate === today) {
        return {
          alreadyAwarded: true,
          newTotalXp: data.totalXp as number,
          newCoins: data.coins as number,
        }
      }

      const newXp = ((data.totalXp as number) ?? 0) + xpAmount
      const newCoins = ((data.coins as number) ?? 0) + coinAmount

      tx.update(userRef, {
        totalXp: newXp,
        coins: newCoins,
        lastXpDate: today,
      })

      return { alreadyAwarded: false, newTotalXp: newXp, newCoins }
    })
  },
}
