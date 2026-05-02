import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'

export async function recordSignIn(user) {
  if (!user?.uid) return

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  const profile = {
    displayName: user.displayName || null,
    email: user.email || null,
    photoURL: user.photoURL || null,
    provider: user.providerData?.[0]?.providerId || 'unknown',
    lastLoginAt: serverTimestamp(),
    loginCount: increment(1),
  }
  if (!snap.exists()) profile.createdAt = serverTimestamp()

  await setDoc(userRef, profile, { merge: true })

  await addDoc(collection(db, 'users', user.uid, 'logins'), {
    at: serverTimestamp(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    language: typeof navigator !== 'undefined' ? navigator.language : null,
  })
}
