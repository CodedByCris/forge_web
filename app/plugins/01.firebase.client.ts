import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyD6oWZvs8d-8WVyxQ6-22T4URvhsJxLmG4',
  authDomain: 'gym-app-41fd6.firebaseapp.com',
  projectId: 'gym-app-41fd6',
  storageBucket: 'gym-app-41fd6.firebasestorage.app',
  messagingSenderId: '556187062060',
  appId: '1:556187062060:web:d976cdde3e98e65a51a689',
}

export default defineNuxtPlugin(() => {
  if (getApps().length === 0) {
    initializeApp(firebaseConfig)
  }
})
