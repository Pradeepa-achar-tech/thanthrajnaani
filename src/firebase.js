import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Single shared Firebase app for the Portfolio + clubbed courses.
// Uses the dedicated `thanthrajnaani-45ccc` project for Google sign-in and
// Firestore persistence (study list + per-course progress).
const firebaseConfig = {
  apiKey: 'AIzaSyCvdh2eM6T7N8lsyeDLDYsu9rAQskKUQns',
  authDomain: 'thanthrajnaani-45ccc.firebaseapp.com',
  projectId: 'thanthrajnaani-45ccc',
  storageBucket: 'thanthrajnaani-45ccc.firebasestorage.app',
  messagingSenderId: '522781628983',
  appId: '1:522781628983:web:91deb2350431e360c37db2',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
