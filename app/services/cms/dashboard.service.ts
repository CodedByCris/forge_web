import { getFirestore, collection, query, where, getCountFromServer } from 'firebase/firestore'

export interface CmsDashboardStats {
  usersCount: number
  activeExercisesCount: number
  faqCount: number
  postsCount: number
}

export async function getDashboardStats(): Promise<CmsDashboardStats> {
  const db = getFirestore()

  const [usersSnap, exercisesSnap, faqSnap, postsSnap] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(query(collection(db, 'exercises'), where('isActive', '==', true))),
    getCountFromServer(collection(db, 'faq')),
    getCountFromServer(collection(db, 'posts')),
  ])

  return {
    usersCount: usersSnap.data().count,
    activeExercisesCount: exercisesSnap.data().count,
    faqCount: faqSnap.data().count,
    postsCount: postsSnap.data().count,
  }
}
