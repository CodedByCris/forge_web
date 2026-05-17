import { getApps, initializeApp } from 'firebase/app'

// TODO: fill in your Firebase config values
// Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
  apiKey: 'AIzaSyAaCdZzn_8BhErljCrZuBZDtkLQyZDRaII',
  authDomain: 'gym-app-41fd6.firebaseapp.com',
  projectId: 'gym-app-41fd6',
  storageBucket: 'gym-app-41fd6.firebasestorage.app',
  messagingSenderId: '556187062060',
  appId: '1:556187062060:android:fe4d0b936e6e97d651a689',
}

export default defineNuxtPlugin(() => {
  if (getApps().length === 0) {
    initializeApp(firebaseConfig)
  }
})
