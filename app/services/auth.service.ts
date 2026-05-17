import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(getAuth(), email, password)
    return cred.user
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(getAuth())
  },

  onAuthStateChanged(cb: (user: User | null) => void): () => void {
    return onAuthStateChanged(getAuth(), cb)
  },

  get currentUser(): User | null {
    return getAuth().currentUser
  },
}
